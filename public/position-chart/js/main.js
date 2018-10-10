var selected_position = Vue.extend({
    type: 'selected_position',
    delimiters: ['${', '}$'],
    template: $('#cjs-component-selected-position').html(),
    data: function () {
        return {
            value: '',
            search_staff: '',
            group_position:[]
        }
    },
    methods:{
        search_position: function (queryString, callback) {
            var that = this;
            var query = that.search_staff || '';
            cloudjetRequest.ajax({
                method: "GET",
                url: "/api/v2/position/search/?query=" + query,
                success: function (res) {
                    callback(res);
                }
            });
        },
        handleSelect: function (item) {
            var self = this;
            console.log(item);
            self.search_staff = item.name;
            self.$emit('get-id-position',item.id);
            search_position(item.id);
        },
    }
});
Vue.component('cjs-component-selected-position', selected_position);

    var modal_edit_kpi_position = Vue.extend({
    delimiters: ['${', '}$'],
    props: ['kpi'],
    template: $('#edit-import-kpi-position-chart-modal').html(),
    data: function () {
        return {
            data_edit_kpi: {},
            method: ["sum", "average", "most_recent", "tính tổng", "trung bình", "tháng gần nhất"],
        }
    },
    watch: {
        kpi: {
            handler: function (newVal, oldVal) {
                    this.data_edit_kpi = JSON.parse(JSON.stringify(newVal))
            },
            deep: true
        },

    },
    beforeDestroy: function () {
        //  not thing
    },
    methods: {
        triggeredCloseModal: function () {
                var self = this
                self.$emit('dismiss')
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

    }
});

Vue.component('edit-import-kpi-modal',modal_edit_kpi_position);

var importKpiPosition = new Vue({
    el: '#import-kpi-position-chart',
    delimiters: ["${", "}$"],
    data:{
        position_kpi_id:"",
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
            msg: ""
        },
        organization:{},
        file: {},
        check_total: 0,
        method: ["sum", "average", "most_recent", "tính tổng", "trung bình", "tháng gần nhất"],
        group_bsc_category:{
            "F":"financial",
            "C":"customer",
            "P":"internal",
            "L":"learninggrowth",
            "O":"other"
        },
        method_save: '',
    },
    created:{},
    filters:{
        trans_method: function (str) {
            if (str == 'sum') {
                return gettext('sum');
            }
            if (str == 'average') {
                return gettext('average');
            }
            if (str == 'most_recent') {
                return gettext('most_recent');
            }
            return str;
        },
    },
    methods: {
        hideUnusedTableHead: function () {
            console.log("triggered this hiding function")
            setTimeout(function () {
                $($('#import-kpi-page > div.input-upload-file > div:nth-child(2) > div.tb-import-kpi > div > div.el-table__fixed > div.el-table__fixed-header-wrapper > table > thead > tr:nth-child(1) > th.el-table__expand-column.is-leaf').siblings('th')[0]).attr('colspan', 2)
                $('#import-kpi-page > div.input-upload-file> div:nth-child(2) > div.tb-import-kpi > div > div.el-table__fixed > div.el-table__fixed-header-wrapper > table > thead > tr:nth-child(1) > th.el-table__expand-column.is-leaf').hide()
            }, 100)
        },
        getOrg: function () {
            self = this;
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
        getPositionKpiId: function (position_id) {
            var that = this
              cloudjetRequest.ajax({
                method: "GET",
                url: "/api/v2/position-kpi/get-kpilib/?position=" + position_id,
                success: function (data) {
                   console.log("==========>hhahahahaha<========")
                    console.log(data)
                    that.position_kpi_id = data.id;
                },
                error: function () {
                }
            });
        },
        arraySpanMethod({row, column, rowIndex, columnIndex}) {
            if (columnIndex === 0) {
                return [0, 0];
            } else if (columnIndex === 1) {
                return [1, 2];
            }
        },

        objectSpanMethod({row, column, rowIndex, columnIndex}) {
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
        slice_character: function (str) {
            if (str.trim()[0] == '\n') {
                str = str.slice(1, str.length - 1);
                return str.charAt(1).toUpperCase() + str.slice(2);
            }
            str = str.replace(/(?:\r\n|\r|\n)/g, '<br>');
            return str;
        },
        trans_method: function (str) {
            if (str == 'sum') {
                return gettext('sum');
            }
            if (str == 'average') {
                return gettext('average');
            }
            if (str == 'most_recent') {
                return gettext('most_recent');
            }
            return str;
        },
        handleDropFile: function (e) {
            e.stopPropagation();
            e.preventDefault();
            var files = e.dataTransfer.files;
            if (!files[0].type.match('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')) {
                swal(gettext('Error'), gettext("Please choose the document format excel file") + "!", "error");
                $("#file-upload-form")[0].reset();
                return;
            }
            this.handleFile(e);
        },
        handleFile: function (e) {
            that = this;
            that.kpis.length = 0;
            that.check_file = true;
            var files = e.target.files || e.dataTransfer.files;
            var i, f;
            for (i = 0, f = files[i]; i != files.length; ++i) {
                var reader = new FileReader();
                var name = f.name;
                var re = /(\.xlsx|\.xls)$/i;
                if (!re.exec(name)) {
                    swal(gettext('Error'), gettext("Please choose the document format excel file") + "!", "error");
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

                        if (A == undefined ) {
                            swal(gettext('Warning'), gettext("Data is incorrect, please re-check and make sure that template of file is in correct form. Data needs to be input from second line") + "!", "warning");
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
                                    try {

                                        try {
                                            var type_kpi = sheet["A" + i].w;
                                        } catch (err) {
                                            var type_kpi = '';
                                        }

                                        var goal = '';
                                        try {
                                            goal = sheet["B" + i].w;

                                            if (goal != undefined) {

                                                goal = goal.toUpperCase();
                                            }

                                        } catch (err) {

                                        }
                                        var check_goal = "";


                                        var kpi = '';
                                        try {
                                            kpi = sheet["C" + i].w;
                                        } catch (err) {

                                            last_goal_index = i;
                                        }

                                        if (kpi.trim().length != 0 && (goal == undefined || goal == '')) {

                                            if (last_goal == "") {
                                                throw "KPI Goal is missing";
                                            }
                                            else {
                                                console.log(kpi);
                                                goal = last_goal;
                                                check_goal = "Check goal"
                                            }
                                        } else {
                                            last_goal = goal;
                                        }


                                        try {
                                            var unit = sheet["D" + i].w;
                                        } catch (err) {
                                            var unit = '';
                                        }


                                        try {
                                            var measurement = sheet["E" + i].w;
                                        } catch (err) {
                                            var measurement = '';
                                        }

                                        try {
                                            var datasource = sheet["F" + i].w;
                                        } catch (err) {
                                            var datasource = '';
                                        }

                                        try {
                                            var method = sheet["G" + i].w;
                                        } catch (err) {
                                            var method = '';
                                        }

                                        try {
                                            var operator = sheet["H" + i].w;
                                        } catch (err) {
                                            var operator = '';
                                        }


                                        try {
                                            var year = sheet["I" + i].w;
                                        } catch (err) {
                                            var year = '';
                                        }


                                        try {
                                            var t1 = sheet["J" + i].w;
                                        } catch (err) {
                                            var t1 = '';
                                        }


                                        try {
                                            var t2 = sheet["K" + i].w;
                                        } catch (err) {
                                            var t2 = '';
                                        }


                                        try {
                                            var t3 = sheet["L" + i].w;
                                        } catch (err) {
                                            var t3 = '';
                                        }


                                        try {
                                            var q1 = sheet["M" + i].w;
                                        } catch (err) {
                                            var q1 = '';
                                        }

                                        try {
                                            var t4 = sheet["N" + i].w;
                                        } catch (err) {
                                            var t4 = '';
                                        }

                                        try {
                                            var t5 = sheet["O" + i].w;
                                        } catch (err) {
                                            var t5 = '';
                                        }

                                        try {
                                            var t6 = sheet["P" + i].w;
                                        } catch (err) {
                                            var t6 = '';
                                        }

                                        try {
                                            var q2 = sheet["Q" + i].w;
                                        } catch (err) {
                                            var q2 = '';
                                        }

                                        try {
                                            var t7 = sheet["R" + i].w;
                                        } catch (err) {
                                            var t7 = '';
                                        }

                                        try {
                                            var t8 = sheet["S" + i].w;
                                        } catch (err) {
                                            var t8 = '';
                                        }

                                        try {
                                            var t9 = sheet["T" + i].w;
                                        } catch (err) {
                                            var t9 = '';
                                        }

                                        try {
                                            var q3 = sheet["U" + i].w;
                                        } catch (err) {
                                            var q3 = '';
                                        }

                                        try {
                                            var t10 = sheet["V" + i].w;
                                        } catch (err) {
                                            var t10 = '';
                                        }

                                        try {
                                            var t11 = sheet["W" + i].w;
                                        } catch (err) {
                                            var t11 = '';
                                        }

                                        try {
                                            var t12 = sheet["X" + i].w;
                                        } catch (err) {
                                            var t12 = '';
                                        }

                                        try {
                                            var q4 = sheet["Y" + i].w;
                                        } catch (err) {
                                            var q4 = '';
                                        }

                                        try {
                                            var weight = sheet["Z" + i].w;
                                        } catch (err) {
                                            var weight = '';
                                        }

                                        that.kpis.push({
                                            "code": "",
                                            "type_kpi": type_kpi,
                                            "check_goal": check_goal,
                                            "goal": goal,
                                            "kpi": kpi,
                                            "unit": unit,
                                            "measurement": measurement,
                                            "score_calculation_type": method,
                                            "operator": operator,
                                            "t1": t1,
                                            "t2": t2,
                                            "t3": t3,
                                            "t4": t4,
                                            "t5": t5,
                                            "t6": t6,
                                            "t7": t7,
                                            "t8": t8,
                                            "t9": t9,
                                            "t10": t10,
                                            "t11": t11,
                                            "t12": t12,
                                            "q1": q1,
                                            "q2": q2,
                                            "q3": q3,
                                            "q4": q4,
                                            'year': year,
                                            "weight": weight.replace('%', ''),
                                            "not_correct_type_kpi":false,
                                            "check_error_year": false,
                                            "check_error_quarter_1": false,
                                            "check_error_quarter_2": false,
                                            "check_error_quarter_3": false,
                                            "check_error_quarter_4": false,
                                            "index": "",
                                            "bsc_category": "",
                                            "data_source":"",
                                            "_uuid": makeid()


                                        });
                                        console.log(that.kpis);
                                    } catch (err) {
                                        that.is_error = true;
                                        that.kpis.push({
                                            "code": "[Error on line: " + i + "] > " + err

                                        });

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
                                }
                                that.kpis.forEach(function (kpi, index) {
                                    kpi.index = index
                                    that.validate_kpi(index);
                                    console.log(that.kpis[index]);
                                    return kpi
                                })
                                that.hideUnusedTableHead()

                            }, 200);
                        }
                        setTimeout(function () {
                            $('body').loading('stop');

                        }, 1000)
                        //that.workbook = workbook;
                        //debugger;
                    };
                    reader.readAsBinaryString(f);
                }
            }
            $("#file-upload-form, #upload-form")[0].reset();
        },
        addRowError: function (uuid) {
            var self = this;
            if (self.id_row_error.indexOf(uuid) === -1) {
                self.id_row_error.push(uuid)
            } else {
                // not thing
            }
            self.$set(self, 'id_row_error', self.id_row_error)
        },
        removeRowError: function (uuid) {
            console.log(uuid)
            console.log("hell index here")
            var self = this;
            if (self.id_row_error.indexOf(uuid) !== -1) {
                self.id_row_error.splice(self.id_row_error.indexOf(uuid), 1)
            } else {
                //not thing
            }
            self.$set(self, 'id_row_error', self.id_row_error)
        },
        init: function () {

            that = this;
            that.getOrg()
        },
        getCategory: function(category){
            category = category.toString();
            var first_word_category = category[0].toUpperCase();
            var suffixes_category = category.slice(1, category.length);
            if(isNaN(suffixes_category)){
                return "no category"
            }
            for( key in this.group_bsc_category){
                if (first_word_category == key){
                    return this.group_bsc_category[key]
                }
            }
            return "no category"
        },
        check_add_all: function () {
            var count = 0;
            for (var i = 0; i < that.kpis.length; i++) {
                if (kpis[i].msg) return false;
                if (kpis[i].status == 'success') count++;
            }
            return count == that.kpis.length ? false : true;
        },
        checkValidate: function (kpi, sum_q, totalQuarterArray, sum_year) {
            var self = this;
            // Initialize pre condition

            var quarterNeedTocheckSample = [1, 2, 3, 4]
            var quarterNeedToCheck = []

            // Process conditions

            // year target bang voi tong target cac quy
            kpi.year = !$.isNumeric(kpi.year) ? null : parseFloat(kpi.year)
            var yearTargetValid = kpi.year == sum_q
            if (!yearTargetValid) {
                kpi.check_error_year = true
            }
            //bao loi khi thang khong theo phuong phap phan quy
            for (var i = 1; i < 5; i++) {
                kpi['q' + i] = !$.isNumeric(kpi['q' + i]) ? null : parseFloat(kpi['q' + i])
                if (!(kpi['q' + i] == totalQuarterArray[i - 1])) {
                    kpi['check_error_quarter_' + i] = true
                }
            }
            var quarterSumsIsNotNull = totalQuarterArray.reduce(function (prevVal, element) {
                return prevVal && element === null
            }, true)
            if (quarterSumsIsNotNull) {
                kpi.check_error_year = false
            }
            return kpi
        },
        calculationScore: function (score) {
            var self = this
            var year = score.year
            var total_quarter = []
            var count_1 = 0
            var count_2 = 0
            var data_quarter = []
            var all_quarter_array = []
            for (var i = 1; i < 5; i++) {
                data_quarter[i] = {}
                all_quarter_array[i] = $.isNumeric(score['q' + i]) ? parseFloat(score['q' + i]) : null
                data_quarter[i]['month_1'] = $.isNumeric(score['t' + ((i - 1) * 3 + 1)]) ? parseFloat(score['t' + ((i - 1) * 3 + 1)]) : null
                data_quarter[i]['month_2'] = $.isNumeric(score['t' + ((i - 1) * 3 + 2)]) ? parseFloat(score['t' + ((i - 1) * 3 + 2)]) : null
                data_quarter[i]['month_3'] = $.isNumeric(score['t' + ((i - 1) * 3 + 3)]) ? parseFloat(score['t' + ((i - 1) * 3 + 3)]) : null
            }
            total_quarter[0] = calculateYearTotal(all_quarter_array)
            for (var i = 1; i < 5; i++) {
                total_quarter[i] = calculationQuarterTotal(data_quarter[i])
            }
            var total_year = total_quarter.slice().reduce(function (preVal, element) {
                if (element.sum != null) {
                    return preVal + element.sum
                }
                return preVal
            }, null)
            total_quarter.push(total_year)
            console.log(total_quarter)
            return total_quarter
        },
        validateTargetScoreFollowAllocationTarget: function (kpi) {
            var self = this
            var check_score_calculation_type = true
            var p = self.method.indexOf(kpi.score_calculation_type.trim().toLowerCase());
            if (p > 2 & p < 6) {
                self.method_save = self.method[p - 3];
            } else if (0 <= p && p <= 2) {
                self.method_save = self.method[p];
            }
            else {
                self.method_save = self.method[p];
                check_score_calculation_type = false
            }
            kpi.score_calculation_type = self.method_save;
            var total_quarter_array = self.calculationScore(kpi)
            var sum_year = total_quarter_array[5]
            if (check_score_calculation_type) {
                switch (kpi.score_calculation_type) {
                    case "sum":
                        var sum_quarter = total_quarter_array[0].sum
                        var sum_month_follow_quarter_array = [total_quarter_array[1].sum, total_quarter_array[2].sum, total_quarter_array[3].sum, total_quarter_array[4].sum]
                        // par_1 là quarter_1 + quarter_2 + quarter_3 + quarter_4
                        // par_2 là array tông [sum_quarter_1,sum_quarter_2,sum_quarter_3,sum_quarter_4] với sum_quarter_1 = month_1 +month_2 + month_3
                        // par_3 tổng 12 tháng + 4 quý
                        return kpi = self.checkValidate(kpi, sum_quarter, sum_month_follow_quarter_array, sum_year)
                        break;
                    case "most_recent":
                        var most_recent_quarter = total_quarter_array[0].most_recent_quarter;
                        var most_recent_month_follow_quarter_array = [total_quarter_array[1].most_recent_quarter, total_quarter_array[2].most_recent_quarter, total_quarter_array[3].most_recent_quarter, total_quarter_array[4].most_recent_quarter]
                        // par_1 là quý có input gần nhất
                        // par_2 là array các quý lấy tháng có input gần nhất
                        // par_3 tổng 12 tháng + 4 quý
                        return kpi = self.checkValidate(kpi, most_recent_quarter, most_recent_month_follow_quarter_array, sum_year)
                        break;
                    case "average":
                        var average_quarter = total_quarter_array[0].average;
                        var average_month_follow_quarter_array = [total_quarter_array[1].average, total_quarter_array[2].average, total_quarter_array[3].average, total_quarter_array[4].average]
                        // par_1 là trung binh các quý có input
                        // par_2 là array các quý lấy trung binh các tháng
                        // par_3 tổng 12 tháng + 4 quý
                        return kpi = self.checkValidate(kpi, average_quarter, average_month_follow_quarter_array, sum_year)
                        break;
                    default:
                }
            }
            return kpi
        },
        validate_kpi: function (index) {
            var self = this
            var that = this;
            var operator = ['<=', '>=', '='];
            var scores = ['q1', 'q2', 'q3', 'q4'];
            if (index == undefined) {
                return;
            }
            var kpi = self.kpis[index];
            if (self.enable_allocation_target) {
                kpi = that.validateTargetScoreFollowAllocationTarget(kpi)
            }
            kpi.bsc_category = kpi.type_kpi.toString();
            kpi.weight = kpi.weight.toString()
            if (!kpi.score_calculation_type) {
                kpi.score_calculation_type = ""
            }

            if (!kpi.unit) {
                kpi.unit = ""
            }
            if (!kpi.measurement) {
                kpi.measurement = ""
            }
            kpi.msg = '';
            that.check_file = true;
            kpi.status = null;
            var messages = '';
            kpi.validated = true;
            if (kpi.bsc_category.trim() == '') {
                kpi.validated = false;
                kpi.msg = kpi.msg + "\n" + gettext("KPI code must not be empty");
            }else{
                var is_bsc_categoty = self.getCategory(kpi.bsc_category.trim());
                if (is_bsc_categoty == "no category"){
                    kpi.not_correct_type_kpi = true;
                    kpi.msg = kpi.msg + "\n" + gettext("KPI code format is not correct");
                }else{
                    kpi.not_correct_type_kpi = false;
                    kpi.bsc_category = is_bsc_categoty;
                }
            }
            if (that.method.indexOf(kpi.score_calculation_type.trim().toLowerCase()) == -1) {
                kpi.validated = false;
                that.check_file = false;
                kpi.msg = kpi.msg + "\n" + gettext("Score calculation type format is not correct");
            }
            if (operator.indexOf(kpi.operator) == -1 && kpi.operator.trim()) {
                kpi.validated = false;
                that.check_file = false;
                kpi.msg = kpi.msg + "\n" + gettext('Operator format is not correct');
            }
            if ( kpi.operator.trim() == '') {
                kpi.validated = false;
                that.check_file = false;
                kpi.msg = kpi.msg + "\n" + gettext('Operator must not empty');
            }
            scores.forEach(function (score) {
                if (isNaN(kpi[score])) {
                    messages += score.toUpperCase() + "\n"
                }
            });
            if (kpi.msg.trim()[0] == '\n') {
                kpi.msg = kpi.msg.slice(2, kpi.msg.length);
                kpi.msg = kpi.msg.charAt(0).toUpperCase() + kpi.msg.slice(1);
            }
            if (kpi.unit.trim() == '') {
                kpi.validated = false;
                kpi.msg = kpi.msg + "\n" + gettext("Unit is not formatted correctly");
            }

            if (kpi.measurement.trim() == '') {
                kpi.validated = false;
                kpi.msg = kpi.msg + "\n" + gettext("Measurement must not empty");
            }
            if (kpi.weight.trim() == '') {
                kpi.validated = false;
                kpi.msg = kpi.msg + "\n" + gettext("Weight must not empty");
            }

            if (operator.indexOf(kpi.operator) == -1 && kpi.operator) {
                kpi.msg = kpi.msg + "\n" + gettext("Operator format is not correct");
            }
            if (messages) {
                kpi.validated = false;
                messages = messages.slice(0, -2) + " " + gettext("is not numbers");
                kpi.msg = kpi.msg + "\n" + gettext("Quarter score") + " " + messages;
            }
            kpi.weight = kpi.weight.toString();
            kpi.weight = kpi.weight.replace(',', '.');
            if (isNaN(parseFloat(kpi.weight)) && kpi.weight) {
                kpi.validated = false;
                kpi.msg = kpi.msg + "\n" + gettext("Weights are not formatted correctly");
            }
            if (parseFloat(kpi.weight) <= 0) {
                kpi.validated = false;
                kpi.msg = kpi.msg + "\n" + gettext("Weight must be greater than 0");
            }
            if (kpi.check_error_year == true) {
                kpi.validated = false;
                kpi.msg = kpi.msg + "\n" + gettext("Year must be follow score calculation type");
            }
            if (kpi.check_error_quarter_1 == true) {
                kpi.validated = false;
                kpi.msg = kpi.msg + "\n" + gettext("Quarter 1 must be follow score calculation type");
            }
            if (kpi.check_error_quarter_2 == true) {
                kpi.validated = false;
                kpi.msg = kpi.msg + "\n" + gettext("Quarter 2 must be follow score calculation type");
            }
            if (kpi.check_error_quarter_3 == true) {
                kpi.validated = false;
                kpi.msg = kpi.msg + "\n" + gettext("Quarter 3 must be follow score calculation type");
            }
            if (kpi.check_error_quarter_4 == true) {
                kpi.validated = false;
                kpi.msg = kpi.msg + "\n" + gettext("Quarter 4 must be follow score calculation type");
            }
            if (kpi.kpi == '') {
                kpi.validated = false;
                kpi.msg = kpi.msg + "\n" + gettext("Name must not be empty");
            }
            if (kpi.goal == "") {
                kpi.validated = false;
                kpi.msg = kpi.msg + "\n" + gettext("KPI targets must not be empty");
            }
            if (kpi.msg.trim() == '\n') {
                kpi.msg = kpi.msg.slice(2, kpi.msg.length);
                kpi.msg = kpi.msg.charAt(0).toUpperCase() + kpi.msg.slice(1);
            }
            kpi.msg = kpi.msg.trim();

            console.log(kpi.msg)
            if (kpi.msg != '') {
                self.addRowError(kpi._uuid)
            } else {
                self.removeRowError(kpi._uuid)
            }
            that.$set(that.kpis, index, kpi);
            that.$set(that.data_edit_kpi, 'msg', kpi.msg);
            try {
                // auto scroll to error messages
                setTimeout(function () {
                    $('.modal-body').scrollTo($('small.error').closest('.content'))
                }, 200)
            } catch (err) {

            }
            that.$set(that.kpis, index, kpi);
        },
        to_string: function (value) {
            return value != null ? value.toString() : null;
        },
        check_format_operator: function (_operator) {
            var operator = ['<=', '>=', '='];
            return operator.indexOf(_operator) == -1;
        },
        edit_kpi: function (index) {
            that = this;
            that.data_edit_kpi.check_error = false;
            that.data_edit_kpi.msg = that.kpis[index].msg;
            that.data_edit_kpi.data = JSON.parse(JSON.stringify(that.kpis[index]));
            console.log(that.data_edit_kpi.data)
            if (that.data_edit_kpi.data.score_calculation_type.trim().toLowerCase() == '' || that.data_edit_kpi.data.score_calculation_type.trim().toLowerCase() == 'most recent') {
                // {#that.data_edit_kpi.data.score_calculation_type = 'most_recent';#}
            }
            else if (that.method.indexOf(that.data_edit_kpi.data.score_calculation_type.trim().toLowerCase()) > -1) {
                that.method_save = that.data_edit_kpi.data.score_calculation_type;
                p = that.method.indexOf(that.data_edit_kpi.data.score_calculation_type.trim().toLowerCase());
                if (p > 2) {
                    that.data_edit_kpi.data.score_calculation_type = that.method[p - 3];
                }
                if (p < 3) {
                    that.data_edit_kpi.data.score_calculation_type = that.method[p];
                }
            }
            if (parseFloat(that.data_edit_kpi.data.weight) != NaN) {
                that.data_edit_kpi.data.weight = parseFloat(that.data_edit_kpi.data.weight);
            }
            that.data_edit_kpi.index = index;
            setTimeout(function () {
                $('#edit-import-kpi-position-chart').modal('show');
                $('.modal-dialog .modal-body').attr('style', 'max-height:' + parseInt(screen.height * 0.6) + 'px !important; overflow-y: auto');
            }, 200)
        },
        resetErrorMsg: function (kpi) {
            kpi.check_error_year = false;
            kpi.check_error_quarter_1 = false;
            kpi.check_error_quarter_2 = false;
            kpi.check_error_quarter_3 = false;
            kpi.check_error_quarter_4 = false;
        },
        confirm_edit_kpi: function (kpi) {
            var self = this;
            self.resetErrorMsg(kpi.data)
            self.kpis[kpi.index] = kpi.data;
            kpi.data.msg = '';
            self.validate_kpi(kpi.index)
            self.data_edit_kpi.data = self.kpis[kpi.index]
            setTimeout(function () {
                if (!$('.text-muted').length) {
                    $("body.bg-sm").removeAttr("style");
                    setTimeout(function () {
                        $('#edit-import-kpi-position-chart').modal('hide');
                        swal({
                            title: gettext("Success"),
                            text: gettext("Edit import KPI success!"),
                            type: "success",
                            timer: 2000,
                            confirmButtonColor: "#43ABDB"
                        });
                    }, 200)
                    return;
                }
            }, 1000)

            if (self.method.indexOf(kpi.data.score_calculation_type.trim().toLowerCase()) != -1) kpi.data.score_calculation_type = self.trans_method(kpi.data.score_calculation_type);

        },
        convertNewStructData: function (kpi) {
            var data_import_kpi = {
                year_target: kpi.year,
                quarter_1_target: kpi.q1,
                quarter_2_target: kpi.q2,
                quarter_3_target: kpi.q3,
                quarter_4_target: kpi.q4,
                bsc_category: kpi.bsc_category,
                group_name: kpi.goal,
                kpilib_unique_id:'',
                name: kpi.kpi,
                unit: kpi.unit,
                current_goal: kpi.measurement,
                score_calculation_type: kpi.score_calculation_type,
                operator: kpi.operator,
                weight: kpi.weight,
                kpi_code: kpi.type_kpi,
                data_source: kpi.data_source,
                refer_relationship: [],
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
            var that = this;
            $('#error_modal').modal('hide');
            if (index == undefined) {
                return;
            }
            //   console.log(index);

            var kpi = that.kpis[index];

            kpi.status = "adding";
            if ((kpi.score_calculation_type.trim().toLowerCase() == '' || kpi.score_calculation_type.trim().toLowerCase() == 'most recent')){
                kpi.score_calculation_type = 'most_recent';
            }
            that.$set(that.kpis, index, kpi);

            var p = that.method.indexOf(kpi.score_calculation_type.trim().toLowerCase());
            if (p > 2 & p<6) {
                that.method_save = that.method[p - 3];
            }else if( 0 <= p && p<=2){
                self.method_save = self.method[p];
            }
            else {
                self.method_save = self.method[p];
            }
            kpi.score_calculation_type = that.method_save;

            if (that.to_string(kpi.q1) == '') {
                kpi.q1 = null;
            }
            if (that.to_string(kpi.q2) == '') {
                kpi.q2 = null;
            }
            if (that.to_string(kpi.q3) == '') {
                kpi.q3 = null;
            }
            if (that.to_string(kpi.q4) == '') {
                kpi.q4 = null;
            }
            if (that.to_string(kpi.year) == '') {
                kpi.year = null;
            }
            var kpi_data_import = that.convertNewStructData(kpi)
            if(that.position_kpi_id == "") {
                swal({
                    title: gettext("Error"),
                    text: gettext("Not selected position chart yet"),
                    type: 'error',
                    animation: false
                });
            }else {
                    cloudjetRequest.ajax({
                        type: "POST",
                        url: "/api/v2/position-kpi/" + that.position_kpi_id + "/add/",
                        data: JSON.stringify({
                            kpi: kpi_data_import
                        }),
                        success: function (data) {
                            kpi.status = "success";
                            that.$set(that.kpis, index, kpi);
                            kpi.score_calculation_type = that.method[p];
                        },
                        error: function (jqXHR) {
                            requestcenterHideNotification();
                            var html = ''
                            if (jqXHR.responseJSON['exception']) {
                                html = '<ol class="text-left">\n';
                                Object.keys(jqXHR.responseJSON['exception']).forEach(function (key) {
                                    html += '<li>"' + key + '": ' + jqXHR.responseJSON['exception'][key] + '</li>\n';
                                });
                                html += '</ol>\n';
                            }
                            that.$alert('<strong>This is <i>HTML</i> string</strong>', 'HTML String', {
                                dangerouslyUseHTMLString: true
                            });
                            swal({
                                title: '<h4 class>' + jqXHR.responseJSON['message'] + '</h4>',
                                html: html,
                                type: 'error',
                                animation: false
                            });
                            try {
                                kpi.msg = jqXHR.responseJSON['message'];
                            } catch (err) {
                            }
                            kpi.status = "failed";
                            that.$set(that.kpis, index, kpi);
                        },

                        contentType: "application/json"

                    });
                }

        },
        add_all_kpi: function () {
            this.kpis.forEach(function (kpi, index) {
                if (kpi.status != 'success') {
                    $('#add_kpi' + index).click();
                }
            })
        },
    },
    created: function () {
        // fetch the data when the view is created and the data is
        // already being observed
        this.init()
    }
})