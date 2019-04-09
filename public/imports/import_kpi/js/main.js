/*
  quocduan note: this method is the fucking trick,
*  so, we should check later for the better way to archive what we want
* */

window.parseFloatWeight = function(weight_percent){
    return $.isNumeric(weight_percent) ? Decimal.mul(parseFloat(weight_percent), 100).toNumber() : NaN;
};

function format(number) {

    var decimalSeparator = ".";
    var thousandSeparator = ",";

    // make sure we have a string
    var result = String(number);

    // split the number in the integer and decimals, if any
    var parts = result.split(decimalSeparator);

    // reverse the string (1719 becomes 9171)
    result = parts[0].split("").reverse().join("");

    // add thousand separator each 3 characters, except at the end of the string
    result = result.replace(/(\d{3}(?!$))/g, "$1" + thousandSeparator);

    // reverse back the integer and replace the original integer
    parts[0] = result.split("").reverse().join("");

    // recombine integer with decimals
    return parts.join(decimalSeparator);

};
Vue.component('decimal-input-import', {
    props: [
        'value',
        'inputclass',
        'disabled',
    ],
    template: `
        <input 
            type="text" v-model="model"
            v-bind:class="inputclass" 
            v-on:keypress="check_number"
            @paste.prevent
            v-bind:disabled="disabled"
        >
    `,
    computed: {
        model:{
            get: function(){
                return this.$options.filters.decimalDisplay(this.value);

            },
            set: function(val){
                val = String(val).trim()
                var newVal=val;
                if (val === '') {
                    newVal = null;
                }
                else {
                    var number = val.split(",").join("");
                    number = Number(number);
                    // Toan note: ref https://stackoverflow.com/a/5963202/2599460
                    newVal = $.isNumeric(number) ? parseFloat(number) : null ;
                }

                this.$emit('input', newVal);

            },
        }
    },
    methods: {
        check_number: function (e){
            // With Firefox e.keyCode alway return 0
            var charCode = e.which || e.keyCode;
            var _number = String.fromCharCode(charCode);

            // For firefox, include 'Arrow left, arrow right, backspace, delete'.
            var controlKeyAllowPress = [37, 39, 8, 46];
            if ('0123456789.'.indexOf(_number) !== -1 || controlKeyAllowPress.indexOf(charCode) !== -1) {
                return _number;
            }
            e.preventDefault();
            return false;
        },
    }

});

Vue.component('edit-import-kpi-modal', {
    delimiters: ['${', '}$'],
    props: ['kpi'],
    template: $('#edit-import-kpi-modal').html(),
    data: function () {
        return {
            data_edit_kpi: {},
            method: ["sum", "average", "most_recent", "tính tổng", "trung bình", "tháng gần nhất"],
        }
    },
    mounted: function () {
        // {#            this.old_data = this.kpi#}
    },
    created: function () {
        // {#            console.log("======><><><><><><><kpppppppppppppppppppppppi><><><><><><><<><=======")#}
        // {#            this.edit_target_data = this.kpi#}
    },
    watch: {
        kpi: {
            handler: function (newVal, oldVal) {
                // {#                    console.log("triggered change kpi object")#}
                // {#                    console.log(newVal)#}
                    this.data_edit_kpi = JSON.parse(JSON.stringify(newVal))
            },
            deep: true
        },
    },
    beforeDestroy: function () {
        //            this.$off('dismiss')
    },
    methods: {
        triggeredCloseModal: function () {
                var self = this
                self.$emit('dismiss')
        },
        trimField:function(val){
            return String(val).trim()
        },
        check_format_operator: function (_operator) {
            var operator = ['<=', '>=', '='];
            return operator.indexOf(_operator) == -1;
        },
        to_string: function (value) {
            return value != null ? value.toString() : null;
        },
        trigger_confirm_edit_kpi: function () {
            var self = this
                self.$emit('comfirm',self.data_edit_kpi)
        },
        isEmailFormatValid: function (email) {
             if (email) {
                 return /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/gi.test(email);
             }
            return false;
        },
        checkTypeKPI: function(type_kpi){
            return /^([fclopFCLOP]{1}[0-9]+)((\.[0-9]+)*)$/gi.test(type_kpi)
        },
    }
})

const Home = {
// {#                    template: '#home-template',#}
el: '#home-template',
    //  template : "<div>abc</div>",
    mounted: function(){
    var self = this;
    window.import_app = this;
    /*
    * Quick hack
    * */



    /* end quick hack */
},
data: function () {
    return {
        info_msg_box:{
            show_infor_msg: false,
            type_msg:'',//success or error
            tite_msg:'',// thêm kpi thất bại
            array_msg:[]// [mã kpi quá 100 ký tư, mục tiêu kpi quá 300 ký tự]
        },
        enable_allocation_target:  false,
        alert_import_kpi: true,
        id_row_error: [],
        kpis: [],
        workbook: {},
        is_error: false,
        error_add: '',
        check_error_upload: false,
        check_file: true,
        data_edit_kpi: {
            data: {},
            index: -1,
            check_error: false,
            msg: [],
        },
        organization:{},
        file: {},
        check_total: 0,
        method: ["sum", "average", "most_recent", "tổng", "trung bình", "tháng/quý gần nhất"],
        method_save: '',

    }
},
filters: {
    trans_method: function(str){
        if(str=='sum'){
            return gettext('sum');
        }
        if(str=='average'){
            return gettext('average');
        }
        if(str=='most_recent'){
            return gettext('most_recent');
        }
        return str;
    },

},
methods: {
    hideUnusedTableHead: function(){
        console.log("triggered this hiding function")
        setTimeout(function(){
            $($('#import-kpi-page > div:nth-child(3) > div.tb-import-kpi > div > div.el-table__fixed > div.el-table__fixed-header-wrapper > table > thead > tr:nth-child(1) > th.el-table__expand-column.is-leaf').siblings('th')[0]).attr('colspan',2)
            $('#import-kpi-page > div:nth-child(3) > div.tb-import-kpi > div > div.el-table__fixed > div.el-table__fixed-header-wrapper > table > thead > tr:nth-child(1) > th.el-table__expand-column.is-leaf').hide()
        },100)
    },
    getOrg: function () {
            var self = this;
            cloudjetRequest.ajax({
                method: "GET",
                url: "/api/organization",
                success: function (data) {
                    if (data) {
                        self.organization = data;
                        self.enable_allocation_target = data.enable_require_target
                    }
                },
                error: function () {
                }
            });
        },

    renderHeaderButton(h, {column}) {
        var self = this
        var result = h('el-button', {
            props: {
                size: 'mini',
                type: 'primary',
                icon: 'el-icon-plus'
            },
            style: 'font-weight: normal;padding: 2px 4px',
            on: {
                click(e) {
                    if (confirm("Bạn muốn thêm tất cả KPI?")) {
                        let promise = $.when();
                        self.kpis.forEach(function (kpi, index) {
                            promise = promise.then(function () {
                                if (kpi.msg && kpi.msg.length == 0 && $(`#add_kpi${index}`).length > 0) {
                                    return self.add_kpi(index);
                                }
                                return;
                            });
                        });
                    }
                }
            }
        })
        return h('el-tooltip', {props: {content: "Thêm tất cả", placement: "top"}}, [result])
    },
    arraySpanMethod({ row, column, rowIndex, columnIndex }) {
        if (columnIndex === 0) {
            return [0, 0];
        } else if (columnIndex === 1) {
            return [1, 2];
        }
    },

    objectSpanMethod({ row, column, rowIndex, columnIndex }) {
        if (columnIndex === 0) {
            if (rowIndex % 2 === 0) {
                return {
                    rowspan: 2,
                    colspan: 1
                };
            } else {
                return {
                    rowspan: 0,
                    colspan: 0
                };
            }
        }
    },

    tableRowClassName: function ({row, rowIndex}) {
        var self = this
        var classText = "";
        if (self.id_row_error.indexOf(row._uuid) !== -1) {
            classText += "warning-row ";
        }
        return classText;
    },
    slice_character: function(str){
        if(str.trim()[0]=='\n') {
            str=str.slice(1,str.length-1);
            return str.charAt(1).toUpperCase() + str.slice(2);
        }
        str = str.replace(/(?:\r\n|\r|\n)/g, '<br>');
        return str;
    },
    trans_method: function(str){
        if(str=='sum'){
            return gettext('sum');
        }
        if(str=='average'){
            return gettext('average');
        }
        if(str=='most_recent'){
            return gettext('most_recent');
        }
        return str;
    },
    trigger_close_msg_box: function(){
        // reset infor msg box
        var self = this
        var msg_box = {
            show_infor_msg: false,
            type_msg:'',
            tite_msg:'',
            array_msg:[]
        }
        self.info_msg_box = Object.assign(self.info_msg_box, msg_box)
    },
    handleDropFile: function (e) {
        var that = this
        e.stopPropagation();
        e.preventDefault();
        var files = e.dataTransfer.files;
        if (!files[0].type.match('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')) {
            that.info_msg_box.show_infor_msg = true;
            that.info_msg_box.type_msg = "error";
            that.info_msg_box.tite_msg = "Nhập dữ liệu không thành công"
            that.info_msg_box.array_msg.push(gettext("Please choose the document format excel file"))
            $("#file-upload-form")[0].reset();
            return;
        }
        this.handleFile(e);
    },
    checkTypeKPI: function(type_kpi){
        return /^([fclopFCLOP]{1}[0-9]+)((\.[0-9]+)*)$/gi.test(type_kpi)
    },
    handleFile: function (e) {
        var that = this;
        that.kpis.length = 0;
        that.check_file = true;
        that.is_error = false;
        var files = e.target.files || e.dataTransfer.files;
        var i, f;
        for (i = 0, f = files[i]; i != files.length; ++i) {
            var reader = new FileReader();
            var name = f.name;
            var re = /(\.xlsx|\.xls)$/i;
            if (!re.exec(name)) {
                that.info_msg_box.show_infor_msg = true;
                that.info_msg_box.type_msg = "error";
                that.info_msg_box.tite_msg = "Nhập dữ liệu không thành công"
                that.info_msg_box.array_msg.push(gettext("Please choose the document format excel file")+ "!")
            }
            else {
                that.file = f;
                reader.onload = function (e) {
                    var data = e.target.result;

                    var workbook = XLSX.read(data, {type: 'binary'});

                    /* DO SOMETHING WITH workbook HERE */
//                                        console.log(workbook);

                    var sheet = workbook.Sheets[workbook.SheetNames[0]];
                    var A = sheet.C1;

                    if (A == undefined || sheet.AA1 == undefined || sheet.AE1 != undefined) {
                        that.info_msg_box.show_infor_msg = true;
                        that.info_msg_box.type_msg = "error";
                        that.info_msg_box.tite_msg = "Nhập dữ liệu không thành công"
                        that.info_msg_box.array_msg.push(gettext("Data is incorrect, please re-check and make sure that template of file is in correct form. Data needs to be input from second line") + "!")
                        sheet = null;
                        that.check_error_upload = false;
                    } else {
                        $('body').loading({
                            stoppable: true,
                            message: gettext("Loading...")
                    });
                        setTimeout(function () {
                            var i = 2;
                            var last_goal_index = 2;
                            var last_goal = "";
                            that.check_error_upload = true;
                            while (A != undefined) {
                                var kpi = that.parseDataImport(sheet,i,last_goal)
                                if(kpi){
                                    last_goal = kpi.last_goal;
                                    that.kpis.push(kpi);
                                }else{
                                    that.info_msg_box.show_infor_msg = true;
                                    that.info_msg_box.type_msg = "error";
                                    that.info_msg_box.tite_msg = "Nhập dữ liệu không thành công"
                                    that.info_msg_box.array_msg.push("Dữ liệu dòng: "+ i + " không đúng")
                                    break;
                                }
                                i += 1;

                                A = sheet["C" + i];
                                if (A == undefined) {
                                    A = sheet["D" + i];
                                }
                                if (A == undefined) {
                                    A = sheet["C" + (i + 1)];
                                }
                                if (A == undefined) {
                                    A = sheet["D" + (i + 1)];
                                }
                                if (A == undefined) {
                                    A = sheet["A" + (i + 1)];
                                }
                                if (A == undefined) {
                                    A = sheet["AA" + (i + 1)];
                                }
                                if (A == undefined) {
                                    A = sheet["Z" + (i + 1)];
                                }
                            }
                            async.waterfall(
                                that.kpis.forEach(function (kpi, index) {
                                    kpi.index = index
                                    kpi = that.validate_kpi(kpi);
                                    // that.$set(that.kpis, index, kpi);
                                    return kpi
                                })
                            )
                            that.hideUnusedTableHead()

                        }, 200);
                    }
                    setTimeout(function () {
                        $('body').loading('stop');

                    }, 1000)
                    //that.workbook = workbook;
                    //;
                };
                reader.readAsBinaryString(f);
            }
        }
        $("#file-upload-form, #upload-form")[0].reset();
    },
    parseDataImport: function(sheet, row,last_goal){
        var self = this
        var last_goal_index = 2
        var kpi={}
        try {
            var kpi_id = '';
            try {
                 kpi_id = String(sheet["A" + row].v).trim();
            } catch (err) {
                 kpi_id = '';
            }
            var goal = '';
            try {
                 goal = String(sheet["B" + row].v).trim();

                if (goal != undefined) {
                    goal = goal.toUpperCase();
                }

            } catch (err) {
                 goal = ''
            }
            var check_goal = "";
            var kpi = "";
            try {
                kpi = String(sheet["C" + row].v).trim();
            } catch (err) {
                kpi = ""
                last_goal_index = row;
            }

            if (kpi.length != 0 && (goal == undefined || goal == '')) {
                goal = last_goal;
                check_goal = "Check goal"
            } else {
                last_goal = goal;
            }

            var unit = '';
            try {
                 unit = String(sheet["D" + row].v).trim();
            } catch (err) {
                 unit = '';
            }

            var measurement = '';
            try {
                 measurement = String(sheet["E" + row].v).trim();
            } catch (err) {
                 measurement = '';
            }
            var datasource = '';
            try {
                 datasource = String(sheet["F" + row].v).trim();
            } catch (err) {
                 datasource = '';
            }
            var method = '';
            try {
                method = String(sheet["G" + row].v).trim();
            } catch (err) {
                method = '';
            }
            var operator = '';
            try {
                var operator = String(sheet["H" + row].v).trim();
            } catch (err) {
                var operator = '';
            }

            var year = null;
            try {
                 year = String(sheet["I" + row].v).trim();
            } catch (err) {
                 year = null;
            }

            var t1 = null;
            try {
                 t1 = String(sheet["J" + row].v).trim();
            } catch (err) {
                 t1 = null;
            }

            var t2 = null;
            try {
                 t2 = String(sheet["K" + row].v).trim();
            } catch (err) {
                 t2 = null;
            }

            var t3 = null;
            try {
                 t3 = String(sheet["L" + row].v).trim();
            } catch (err) {
                 t3 = null;
            }

            var q1 = null;
            try {
                 q1 = String(sheet["M" + row].v).trim();
            } catch (err) {
                 q1 = null;
            }
            var t4 = null;
            try {
                 t4 = String(sheet["N" + row].v).trim();
            } catch (err) {
                 t4 = null;
            }
            var t5 = null;
            try {
                 t5 = String(sheet["O" + row].v).trim();
            } catch (err) {
                 t5 = null;
            }
            var t6 = null;
            try {
                 t6 = String(sheet["P" + row].v).trim();
            } catch (err) {
                 t6 = null;
            }
            var q2 = null;
            try {
                 q2 = String(sheet["Q" + row].v).trim();
            } catch (err) {
                 q2 = null;
            }
            var t7 = null;
            try {
                 t7 = String(sheet["R" + row].v).trim();
            } catch (err) {
                 t7 = null;
            }
            var t8 = null;
            try {
                 t8 = String(sheet["S" + row].v).trim();
            } catch (err) {
                 t8 = null;
            }
            var t9 = null;
            try {
                 t9 = String(sheet["T" + row].v).trim();
            } catch (err) {
                 t9 = null;
            }
            var q3 = null;
            try {
                 q3 = String(sheet["U" + row].v).trim();
            } catch (err) {
                 q3 = null;
            }
            var t10 = null;
            try {
                 t10 = String(sheet["V" + row].v).trim();
            } catch (err) {
                 t10 = null;
            }
            var t11 = null;
            try {
                t11 = String(sheet["W" + row].v).trim();
            } catch (err) {
                t11 = null;
            }
            var t12 = null;
            try {
                 t12 = String(sheet["X" + row].v).trim();
            } catch (err) {
                 t12 = null;
            }
            var q4 = null;
            try {
                 q4 = String(sheet["Y" + row].v).trim();
            } catch (err) {
                 q4 = null;
            }
             var weight = null;
            try {
                 weight = String(sheet["Z" + row].v).trim();
            } catch (err) {
                 weight = null;
            }

            var email = '';
            try {
                 email = self.isEmailFormatValid(String(sheet["AA" + row].v).trim())?String(sheet["AA" + row].v).trim():'';
            } catch (err) {
                 email = '';
            }

             kpi = {
                "kpi_id": kpi_id,
                "check_goal": check_goal,
                "goal": goal,
                "last_goal":last_goal,
                "kpi": kpi,
                "unit": unit,
                "measurement": measurement,
                "score_calculation_type": method,
                "operator": operator,
                "t1": $.isNumeric(t1) ?self.config_decimal_input(t1): t1,
                "t2": $.isNumeric(t2) ?self.config_decimal_input(t2): t2,
                "t3": $.isNumeric(t3) ?self.config_decimal_input(t3): t3,
                "t4": $.isNumeric(t4) ?self.config_decimal_input(t4): t4,
                "t5": $.isNumeric(t5) ?self.config_decimal_input(t5): t5,
                "t6": $.isNumeric(t6) ?self.config_decimal_input(t6): t6,
                "t7": $.isNumeric(t7) ?self.config_decimal_input(t7): t7,
                "t8": $.isNumeric(t8) ?self.config_decimal_input(t8): t8,
                "t9": $.isNumeric(t9) ?self.config_decimal_input(t9): t9,
                "t10": $.isNumeric(t10) ?self.config_decimal_input(t10): t10,
                "t11": $.isNumeric(t11) ?self.config_decimal_input(t11): t11,
                "t12": $.isNumeric(t12) ?self.config_decimal_input(t12): t12,
                "q1": $.isNumeric(q1) ?self.config_decimal_input(q1): q1,
                "q2": $.isNumeric(q2) ?self.config_decimal_input(q2): q2,
                "q3": $.isNumeric(q3) ?self.config_decimal_input(q3): q3,
                "q4": $.isNumeric(q4) ?self.config_decimal_input(q4): q4,
                'year': $.isNumeric(year) ?self.config_decimal_input(year): year,
                "weight": $.isNumeric(weight)?self.config_decimal_input(parseFloatWeight(weight)):weight,
                "email": email,
                "check_error_year": false,
                "check_error_quarter_1": false,
                "check_error_quarter_2": false,
                "check_error_quarter_3": false,
                "check_error_quarter_4": false,
                "index": "",
                "msg":[],
                "_uuid": makeid(),
                "code_kpi_existed":false,
                "email_is_incorrect":false
            };
            console.log(self.kpis);
        } catch (err) {
            self.is_error = true;
            return false
        }
        return kpi
    },
    config_decimal_input: function(val,maxDecimalLength = 5){
        val = Decimal(val).toFixed(maxDecimalLength)
        return parseFloat(val)
    },
    addRowError: function(uuid){
        var self = this;
        if(self.id_row_error.indexOf(uuid) === -1){
            self.id_row_error.push(uuid)
        }else{
            // not thing
        }
        self.$set(self,'id_row_error',self.id_row_error)
    },
    removeRowError: function(uuid){
        console.log(uuid)
        console.log("hell index here")
        var self = this;
        if(self.id_row_error.indexOf(uuid) !== -1){
            self.id_row_error.splice(self.id_row_error.indexOf(uuid),1)
        }else{
            //not thing
        }
        self.$set(self,'id_row_error',self.id_row_error)
    },

    isEmailFormatValid: function (email) {
        if (email) {
            return /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/gi.test(email);
        }
        return false;
    },
    init: function () {

        var that = this;
        that.getOrg()

        //  document.getElementById('drop').addEventListener('drop', that.handleDrop, false);


    },
    check_add_all: function () {
        var count = 0;
        var that = this
        for (var i = 0; i < that.kpis.length; i++) {
            if (kpis[i].msg) return false;
            if (kpis[i].status == 'success') count++;
        }
        return count == that.kpis.length ? false : true;
    },
    convert_data_target_to_valid: function(kpi){
        let data = {
            current_quarter: 0,// import not check current quater
            calculation_method_type:kpi.score_calculation_type,
            year_target: kpi.year,
            quarter_1_target : kpi.q1,
            quarter_2_target: kpi.q2,
            quarter_3_target: kpi.q3,
            quarter_4_target: kpi.q4,
            year_data: {
                months_target: {
                    quarter_1: {
                        month_1_target: kpi.t1,
                        month_2_target: kpi.t2,
                        month_3_target: kpi.t3
                    },
                    quarter_2: {
                        month_1_target: kpi.t4,
                        month_2_target: kpi.t5,
                        month_3_target: kpi.t6
                    },
                    quarter_3: {
                        month_1_target: kpi.t7,
                        month_2_target: kpi.t8,
                        month_3_target: kpi.t9
                    },
                    quarter_4: {
                        month_1_target: kpi.t10,
                        month_2_target: kpi.t11,
                        month_3_target: kpi.t12
                    }
                }
            }
        }
        return data
    },
    validateTargetScoreFollowAllocationTarget: function (kpi) {
        // Hàm này chỉ chạy khi hệ thống có bật Ràng buộc chỉ tiêu tháng/quý/năm theo phương pháp đo
        var self = this
        let data_target_to_valid ={}
        let valid_target_obj = {}
        var p = self.method.indexOf(kpi.score_calculation_type.trim().toLowerCase());
        if (p > 2 & p<6){
            self.method_save = self.method[p-3];
        }else if( 0 <= p && p<=2){
            self.method_save = self.method[p];
        }
        else{
            self.method_save = "";
        }
        kpi.score_calculation_type = self.method_save;
        data_target_to_valid = self.convert_data_target_to_valid(kpi)
        valid_target_obj = self.validateAllocationTargetPlan(data_target_to_valid)
        for(let i = 1;i<5;i++){
            if(!valid_target_obj['valid_quarter_' +i]){
                kpi['check_error_quarter_' + i] = true
            }else{
                kpi['check_error_quarter_' + i] = false
            }
        }
        kpi.check_error_year = !valid_target_obj.valid_year?true:false
        return kpi
    },
    validate_kpi: function (kpi) {
        var self = this
        var operator = ['<=', '>=', '='];
        var scores = ['q1', 'q2', 'q3', 'q4'];
        var months = ['t1', 't2', 't3', 't4', 't5', 't6', 't7', 't8', 't9', 't10', 't11', 't12']
        var list_field_name_kpi = ['kpi_id','unit','measurement','weight','goal','kpi','score_calculation_type','operator']
        var object_trans_field = {
            'kpi_id':"Mã KPI",
            'unit': "Đơn vị",
            'measurement': "Phương pháp đo lường",
            'weight': "Trọng số",
            'goal':"Mục tiêu kpi",
            'kpi': "Tên KPI",
            'score_calculation_type': "Phương pháp phân bổ chỉ tiêu",
            'operator':"Toán tử"
        }
        if (kpi.index == undefined) {
            return kpi;
        }
        if (self.enable_allocation_target){
            kpi = self.validateTargetScoreFollowAllocationTarget(kpi)
        }
        kpi.msg = [];
        self.check_file = true;
        var quarter_error = [];// mảng lưu quý bị lỗi
        var months_error = [];// mảng lưu tháng bị lỗi
        cloudjetRequest.ajax({
            type: "POST",
            url: '/api/kpis/import/validate',
            data: JSON.stringify(kpi),
            success: function (responseJSON, textStatus) {
                kpi.status = null;
                if (responseJSON['status'] == 'ok') {
                    kpi.validated = true;
                    kpi.status = responseJSON['status'];
                    kpi.email_is_incorrect = false;
                } else {
                    kpi.status = responseJSON['status'];
                    kpi.validated = false;
                    if (responseJSON['messages'].length>0){
                        self.check_file = false;
                        responseJSON['messages'].forEach(function (message) {
                            if(message.field_name == gettext("In charge Email")){
                                kpi.email_is_incorrect = true
                            }
                            kpi.msg.push(
                                {
                                    'field_name': message.field_name,
                                    'message': message.message
                                })
                        })
                    }
                }
                list_field_name_kpi.forEach(function (field) {
                    kpi.validated = false;
                    if (kpi[field] === "" || kpi[field] === null){
                        kpi.msg.push({
                            'field_name': object_trans_field[field],
                            'message': ' không được để trống'
                        });
                    }
                })
                // check loại kpi phải thuộc ['f', 'c', 'p', 'l', 'o']
                if (kpi.kpi_id){
                    var __kpi_id = kpi.kpi_id.trim()
                    var is_kpi_id = self.checkTypeKPI(__kpi_id)
                    if(!is_kpi_id){
                        kpi.msg.push({
                            'field_name': 'Mã KPI',
                            'message': ' không đúng'
                        });
                    }
                }
                if (operator.indexOf(kpi.operator) == -1 && kpi.operator) {
                    kpi.validated = false;
                    kpi.msg.push({
                        'field_name': 'Toán tử',
                        'message': ' không đúng định dạng'
                    });
                }
                if (self.method.indexOf(kpi.score_calculation_type.toLowerCase()) == -1 && kpi.score_calculation_type){
                    kpi.validated = false;
                    kpi.status = responseJSON['status'];
                    self.check_file = false;
                    kpi.msg.push({
                        'field_name': 'Phương pháp phân bổ chỉ tiêu',
                        'message': ' không đúng định dạng'
                    });
                }
                if (isNaN(kpi.year) ) {
                    kpi.validated = false;
                    kpi.msg.push({
                        'field_name': 'Chỉ tiêu năm',
                        'message': ' không đúng định dạng'
                    });
                }
                scores.forEach(function (score) {
                    if (isNaN(kpi[score])) {
                        quarter_error.push(scores.indexOf(score)+1)
                    }
                })
                months.forEach(function (month) {
                    if (isNaN(kpi[month])) {
                        months_error.push(months.indexOf(month)+1)
                    }
                })
                if (quarter_error.length > 0 ) {
                    kpi.validated = false;
                    var quarter_error_str = quarter_error.join(', ');
                    kpi.msg.push({
                        'field_name': "Chỉ tiêu quý" + " " + quarter_error_str,
                        'message': ' không đúng định dạng'
                    });
                }
                if (months_error.length > 0 ) {
                    kpi.validated = false;
                    var months_error_str = months_error.join(', ');
                    kpi.msg.push({
                        'field_name': "Chỉ tiêu tháng" + " " + months_error_str,
                        'message': ' không đúng định dạng'
                    });
                }

                if (self.enable_allocation_target){
                    kpi = self.validateTargetScoreFollowAllocationTarget(kpi)
                }
                if (isNaN(kpi.weight) && kpi.weight) {
                    kpi.validated = false;
                    kpi.msg.push({
                        'field_name': 'Trọng số',
                        'message': ' không đúng định dạng'
                    });
                }
                if (!isNaN(kpi.weight) && kpi.weight != '' && parseFloatWeight(kpi.weight) < 0 ) {
                    kpi.validated = false;
                    kpi.msg.push({
                        'field_name': 'Trọng số',
                        'message': ' phải lớn hơn hoặc bằng 0'
                    });
                }
                if (kpi.check_error_year == true){
                    kpi.validated = false;
                    kpi.msg.push({
                        'field_name': 'Chỉ tiêu năm',
                        'message': ' phải theo phương pháp phân rã chỉ tiêu'
                    });
                }
                if (kpi.check_error_quarter_1 == true){
                    kpi.validated = false;
                    kpi.msg.push({
                        'field_name': 'Chỉ tiêu quý 1',
                        'message': ' phải theo phương pháp phân rã chỉ tiêu'
                    });
                }
                if (kpi.check_error_quarter_2 == true){
                    kpi.validated = false;
                     kpi.msg.push({
                        'field_name': 'Chỉ tiêu quý 2',
                        'message': ' phải theo phương pháp phân rã chỉ tiêu'
                    });
                }
                if (kpi.check_error_quarter_3 == true){
                    kpi.validated = false;
                     kpi.msg.push({
                        'field_name': 'Chỉ tiêu quý 3',
                        'message': ' phải theo phương pháp phân rã chỉ tiêu'
                    });
                }
                if (kpi.check_error_quarter_4 == true){
                    kpi.validated = false;
                    kpi.msg.push({
                        'field_name': 'Chỉ tiêu quý 4',
                        'message': ' phải theo phương pháp phân rã chỉ tiêu'
                    });
                }
                // if (kpi.msg.trim() == '\n') {
                //     kpi.msg = kpi.msg.slice(2, kpi.msg.length);
                //     kpi.msg = kpi.msg.charAt(0).toUpperCase() + kpi.msg.slice(1);
                // }
                if(kpi.msg.length > 0){
                    self.addRowError(kpi._uuid)
                }else{
                    self.removeRowError(kpi._uuid)
                }
                // self.$set(self.kpis, index, kpi);
                // self.$set(self.data_edit_kpi, 'msg', kpi.msg);
                try{
                    // auto scroll to error messages
                    setTimeout(function(){
                        $('.modal-body').scrollTo($('small.error').closest('.content'))
                    },200)
                }catch(err){

                }
                self.$set(self.data_edit_kpi, 'data', kpi)
                return kpi

            },
            error: function (jqXHR, textStatus) {
                kpi.status = jqXHR.message_request;
                kpi.msg = [];
                try {
                    kpi.msg.push( {'field_name':"Validate failed: ",'message': jqXHR.responseJSON['message']})
                    self.check_file = false;
                } catch (err) {
                }
                if(kpi.msg.length >0){
                    self.addRowError(kpi._uuid)
                }else{
                    self.removeRowError(kpi._uuid)
                }
                return kpi
                // that.$set(that.kpis, index, kpi);
            },
            complete: function (data) {
                self.check_total++;
                if (self.check_total == self.kpis.length) {
                    setTimeout(function () {
                        $('body').loading('stop');
                        self.check_total = 0;
                    }, 1000)
                }
            },

            contentType: "application/json"

        });
        // self.$set(self.kpis, index, kpi);
    },
    to_string: function (value) {
        return value != null ? value.toString() : null;
    },
    check_kpi_child: function (code) {
        return code.indexOf('.') != -1;
    },
    check_format_operator: function (_operator) {
        var operator = ['<=', '>=', '='];
        return operator.indexOf(_operator) == -1;
    },
    edit_kpi: function (index) {
        var that = this;
        that.data_edit_kpi.check_error = false;
        that.data_edit_kpi.msg = that.kpis[index].msg;
        that.data_edit_kpi.data = JSON.parse(JSON.stringify(that.kpis[index]));
        console.log(that.data_edit_kpi.data)
        if (that.data_edit_kpi.data.score_calculation_type.trim().toLowerCase() == '' || that.data_edit_kpi.data.score_calculation_type.trim().toLowerCase()=='most recent'){
            // {#that.data_edit_kpi.data.score_calculation_type = 'most_recent';#}
        }
        else if (that.method.indexOf(that.data_edit_kpi.data.score_calculation_type.trim().toLowerCase())>-1){
            that.method_save = that.data_edit_kpi.data.score_calculation_type;
            var p = that.method.indexOf(that.data_edit_kpi.data.score_calculation_type.trim().toLowerCase());
            if(p > 2 && p<6){
                that.data_edit_kpi.data.score_calculation_type = that.method[p-3];
            }
            else if(0 <= p && p<=2){
                that.data_edit_kpi.data.score_calculation_type = that.method[p];
            }else {
                that.data_edit_kpi.data.score_calculation_type = ""
            }
        }
        that.data_edit_kpi.index = index;
        setTimeout(function () {
            $('#edit-import-kpi').modal('show');
            $('.modal-dialog .modal-body').attr('style', 'max-height:' + parseInt(screen.height * 0.6) + 'px !important; overflow-y: auto');
        }, 200)
    },
    resetErrorMsg: function(kpi){
        kpi.check_error_year = false;
        kpi.check_error_quarter_1 = false;
        kpi.check_error_quarter_2 = false;
        kpi.check_error_quarter_3 = false;
        kpi.check_error_quarter_4 = false;
    },
    confirm_edit_kpi: function (kpi) {
        var self = this;
        var kpi_validate = {}
        self.resetErrorMsg(kpi.data)
        kpi.data.msg = '';
        self.validate_kpi(kpi.data)
        setTimeout(function () {
            if (!$('.text-muted').length) {
                $("body.bg-sm").removeAttr("style");
                self.info_msg_box.show_infor_msg = true;
                if(self.data_edit_kpi.data.msg.length > 0){
                    self.info_msg_box.type_msg = "error";
                    self.info_msg_box.tite_msg = "Chỉnh sửa KPI không thành công"
                    self.data_edit_kpi.data.msg.forEach(function (field) {
                        self.info_msg_box.array_msg.push(field.field_name + ": " + field.message )
                    })

                }else{
                    $('#edit-import-kpi').modal('hide')
                    self.info_msg_box.type_msg = "success";
                    self.info_msg_box.tite_msg = "Chỉnh sửa KPI thành công"
                    self.info_msg_box.array_msg.push("Chỉnh sửa nhập dữ liệu KPI thành công !")
                    self.$set(self.kpis, self.data_edit_kpi.data.index, self.data_edit_kpi.data);
                    setTimeout(function () {
                        self.info_msg_box.show_infor_msg = false;
                    },2000)
                }

                return;
            }
        }, 2000)
        // Không cần thiết vì đã có filter xử lý việc này => tránh lỗi chuyển data kpi.score_calculation_type
        // qua tiếng việt rồi lại qua tiếng anh chỉ để show lên xem
        //
        // if(self.method.indexOf(kpi.data.score_calculation_type.trim().toLowerCase())!=-1)
        //     kpi.data.score_calculation_type = self.trans_method(kpi.data.score_calculation_type);

    },
    format_number_edit: function (keys, id) {
        if (isNaN(keys.key)) {
            data_edit_kpi.data[id] = data_edit_kpi.data[id].slice(0, -1);
        }
    },
    convertNewStructData: function(kpi){
        var data_import_kpi= {
            year_target:$.isNumeric(kpi.year)?parseFloat(kpi.year): null,
            q1: kpi.q1,
            q2: kpi.q2,
            q3: kpi.q3,
            q4: kpi.q4,
            check_goal: kpi.check_goal,
            goal: kpi.goal,
            kpi: kpi.kpi,
            kpi_id: kpi.kpi_id,
            unit: kpi.unit,
            measurement: kpi.measurement,
            score_calculation_type: kpi.score_calculation_type,
            operator: kpi.operator,
            weight: kpi.weight,
            email: kpi.email,
            year_data: {
                months_target: {
                    quarter_1: {
                        month_1_target: kpi.t1,
                        month_2_target: kpi.t2,
                        month_3_target: kpi.t3
                    },
                    quarter_2: {
                        month_1_target: kpi.t4,
                        month_2_target: kpi.t5,
                        month_3_target: kpi.t6
                    },
                    quarter_3: {
                        month_1_target: kpi.t7,
                        month_2_target: kpi.t8,
                        month_3_target: kpi.t9
                    },
                    quarter_4: {
                        month_1_target: kpi.t10,
                        month_2_target: kpi.t11,
                        month_3_target: kpi.t12
                    }
                }
            }

        }
        return data_import_kpi
    },
    add_kpi: function (index) {
        var self = this;
        $('#error_modal').modal('hide');
        if (index == undefined) {
            return;
        }
        var kpi = self.kpis[index];

        kpi.status = "adding";
        if ((kpi.score_calculation_type.trim().toLowerCase() == ''
            || kpi.score_calculation_type.trim().toLowerCase() == 'most recent')
            && self.check_kpi_child(kpi.kpi_id))
            kpi.score_calculation_type = 'most_recent';
        self.$set(self.kpis, index, kpi);

        var p = self.method.indexOf(kpi.score_calculation_type.trim().toLowerCase());
        if (p > 2 && p <6){
            self.method_save = self.method[p-3];
        }
        else if( 0 <= p && p <= 2){
            self.method_save = self.method[p];
        }else {
            self.method_save = "";
        }
        kpi.score_calculation_type = self.method_save;

        var kpi_data_import = self.convertNewStructData(kpi)
        $('.add_kpi_' + index).button('loading')
        let jqxhr = cloudjetRequest.ajax({
            type: "POST",
            url: "/api/kpis/import/add",
            data: JSON.stringify(kpi_data_import),
            success: function (data) {
                //console.log('yes, we can!');
                // router.push('/');
                kpi.status = "success";
                self.$set(self.kpis, index, kpi);
                kpi.score_calculation_type = self.method[p];
                $('.add_kpi_' + index).button('reset')
            },
            error: function (jqXHR) {
                //alert('failed');
                requestcenterHideNotification();
                var title_msg_error = "Thêm KPI thất bại"
                if (jqXHR.responseJSON){
                    if (jqXHR.responseJSON['exception']) {
                        var msg_error
                        Object.keys(jqXHR.responseJSON['exception']).forEach(function (key) {
                            msg_error =  key + ' : ' + jqXHR.responseJSON['exception'][key];
                            self.info_msg_box.array_msg.push(msg_error)
                        });
                    }
                    // if(jqXHR.responseJSON['message']){
                    //     title_msg_error = jqXHR.responseJSON['message']
                    // }
                }else{
                    self.info_msg_box.array_msg.push(jqXHR['message'])
                }
                self.info_msg_box.show_infor_msg = true;
                self.info_msg_box.type_msg = "error";
                self.info_msg_box.tite_msg = title_msg_error
                try {
                    kpi.msg.push({
                        'field_name': '',
                        'message': jqXHR['message']
                    });
                } catch (err) {
                }
                kpi.status = "failed";
                self.$set(self.kpis, index, kpi);
                $('.add_kpi_' + index).button('reset')
            },

            contentType: "application/json"

        });
        return jqxhr;
    },
    add_all_kpi: function () {
        this.kpis.forEach(function (kpi, index) {
            if (kpi.status != 'success') {
                $('#add_kpi' + index).click();
            }
        })
    },
    //end example */
},
delimiters: ['${', '}$'],
    created: function () {
    // fetch the data when the view is created and the data is
    // already being observed
    this.init()
}
,
watch: {
    // call again the method if the route changes
    '$route': 'init'
}
}
;


const routes = [
    {path: '/', component: Home},
//                {path: '/create-account', component: CreateAccount}
];

const router = new VueRouter({
    routes // short for routes: routes
});


const app = new Vue({
    router,

    delimiters: ['${', '}$']

}).$mount('#app');

function validate(evt) {
    var theEvent = evt || window.event;
    var key = theEvent.keyCode || theEvent.which;
    key = String.fromCharCode(key);
    var regex = /[0-9]|\./;
    if (!regex.test(key)) {
        theEvent.returnValue = false;
        if (theEvent.preventDefault) theEvent.preventDefault();
    }
}

