Array.prototype.insert = function (index, item) {
    this.splice(index, 0, item);
};

// -------------------------------------------- seach usser---------------------------------------------
$(function () {
    $("#search_user").focus(function () {
        // targetPage la bien Vue cua page phan bo chi tieu
        targetPage.query = targetPage.query == undefined ? "" : targetPage.query
//                 targetPage.refreshHistoryData()
        if (targetPage.query.length == 0) {
            $("#list_user_suggest").show();
            $(".arrow-up").show();
        } else if (targetPage.list_user_searched.length == 0) {
            $(".no-data").show();
            $(".arrow-up").show();
        }
        else {
            $("#result_searched").show();
        }
        $("#ico-search").show()
        $("#ico-clear").hide();
    });
    $("#search_user").focusout(function () {
        setTimeout(function () {
            $("#list_user_suggest").hide();
            $(".no-data").hide();
            $(".arrow-up").hide();
            $("#ico-search").hide()
            $("#ico-clear").show();
            targetPage.query = targetPage.oldQuery
            $("#result_searched").hide();
        }, 200);
        setTimeout(function () {
            $("#popup-progress").show();
        }, 1000)
    });
});
function clear_history_user() {
    targetPage.storage_user = [];
    var p = JSON.parse(localStorage.getItem('history_search_u'));
    var storage = JSON.parse(localStorage.getItem('history_search'));
    p.splice(p.indexOf('{{ request.user.email }}'), 1);
    storage.splice(p.indexOf('{{ request.user.email }}'), 1);
    localStorage.setItem('history_search', JSON.stringify(storage));
    localStorage.setItem('history_search_u', JSON.stringify(p));
    $(".history_user").hide();
}

function clear_search() {
    targetPage.query = '';
    $("#ico-clear").hide();
    $("#ico-search").show()
    $(".no-data").hide();
    $("#result_searched").hide();
    setTimeout(function () {
        $("#search_user").focus();
    }, 100);
}


String.prototype.nextChar = function (i) {
    function nextChar(c) {
        var u = c.toUpperCase();
        if (same(u, 'Z')) {
            var txt = '';
            var i = u.length;
            while (i--) {
                txt += 'A';
            }
            return (txt + 'A');
        } else {
            var p = "";
            var q = "";
            if (u.length > 1) {
                p = u.substring(0, u.length - 1);
                q = String.fromCharCode(p.slice(-1).charCodeAt(0));
            }
            var l = u.slice(-1).charCodeAt(0);
            var z = nextLetter(l);
            if (z === 'A') {
                return p.slice(0, -1) + nextLetter(q.slice(-1).charCodeAt(0)) + z;
            } else {
                return p + z;
            }
        }
    }

    function nextLetter(l) {
        if (l < 90) {
            return String.fromCharCode(l + 1);
        }
        else {
            return 'A';
        }
    }

    function same(str, char) {
        var i = str.length;
        while (i--) {
            if (str[i] !== char) {
                return false;
            }
        }
        return true;
    }

    var n = i | 1;
    var char = this;
    while (n--) {
        char = nextChar(char);
    }
    return char;
};
Vue.component('decimal-input-edit-target', {
    props: [
        'value',
        'inputClass',
        'disabled',
        'showBtn'
    ],
    template: $('#decimal-input-edit-target-kpi').html(),
    delimiters: ['${', '}$'],
    // props: {
    //     'value':Number,
    //     'inputclass':String,
    //     'disabled':[String, Boolean],
    //      'showBtn':[String, Boolean]
    // }
    // ,
    // template: `
    //     <input
    //     v-model="value"
    //     v-on:input="$emit('input', parseFloat($event.target.value))"
    //     v-bind:class="inputclass"
    //     v-on:save="function"
    //     v-on:cancel="function"
    //     v-bind:disabled="disabled"
    //      v-bind:show-btn="false"
    //     >
    // `,

    data: function(){
        return {
            target_kpi:''
        }
    },

    watch: {
        value: function (val) {
            this.target_kpi = val
        }
    },
    computed: {
        model:{
            get: function(){
                var val = JSON.parse(JSON.stringify(this.value));
                // https://stackoverflow.com/a/33671045/6112615
                return this.$options.filters.decimalDisplay(val, 5);
            },
            set: function(val){
                var newVal=val;
                this.target_kpi = newVal
                if(!this.showBtn){
                    this.$emit('input',newVal)
                }
                return newVal
            },

        }
    },
    methods: {
        check_paste: function (evt) {
            evt.preventDefault();
            evt.stopPropagation();
        },
        save: function () {
            this.$emit('input',this.target_kpi);
            this.$emit('save')
        },
        cancel: function () {
            this.target_kpi = this.value;
            this.$emit('cancel')
        }
    }

});
// Vue.filter('decimalDisplay',  function (val) {
//     return (val === 0) ? 0 : (val == null || val === '') ? '' : format_number(val);
// });
Vue.component('modal-edit-target', {
        delimiters: ['${', '}$'],
        props: ['kpi','optionEditTarget','indexKpi'],
        template: $('#modal-edit-target').html(),
        data: function () {
            return {
                showmodal:false,
                if_kpi_not_edit:"",
                tempMonth : [],
                edit_target_data: {},
                formLabelWidth: '150px',
                is_correct_follow_score_calculation_type: true,
                error_input: {
                    year: false,
                    quarter_1:false,
                    quarter_2:false,
                    quarter_3:false,
                    quarter_4:false,
                }
            }
        },
        mounted: function () {
            // {#            console.log(this.showmodal)#}
            // {#            this.old_data = this.kpi#}
        },
        created: function () {
            // {#            console.log("======><><><><><><><kpppppppppppppppppppppppi><><><><><><><<><=======")#}
            // {#            this.edit_target_data = this.kpi#}
        },
        inject: [
            'updateTarget'
        ],
        watch: {
            kpi: {
                handler: function (newVal, oldVal) {
                    if (newVal.id !== undefined) {
                        this.edit_target_data = JSON.parse(JSON.stringify(newVal))
                        this.if_kpi_not_edit = JSON.parse(JSON.stringify(newVal))
                    }
                },
                deep: true
            }
        },
        beforeDestroy: function () {
            //            this.$off('dismiss')
        },
        methods: {
            showEditTargetModal: function(){
                let that = this
                that.turnOffAllMessage();
                that.showmodal = true;
                that.edit_target_data = {}
                that.$set(this,'edit_target_data', JSON.parse(JSON.stringify(this.kpi)));
            },
            check_paste: function (evt) {
                evt.preventDefault();
                evt.stopPropagation();
            },
            check_number: function(e){
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
            disableToEditTargetKpi: function (quarter_to_edit) {
                if (quarter_to_edit < this.edit_target_data.current_quarter) return true
                return this.edit_target_data.disable_edit
            },
            // triggeredCloseModal: function () {
            //     var self = this
            //     self.$emit('dismiss',this.if_kpi_not_edit)
            //     self.turnOffAllMessage();
            // },
            turnOffAllMessage: function () {
                this.error_input.year = false;
                this.error_input.quarter_1 = false;
                this.error_input.quarter_2 = false;
                this.error_input.quarter_3 = false;
                this.error_input.quarter_4 = false;
            },
            updateAllTarget: function () {
                var that = this;
                that.turnOffAllMessage()
                that.checkMethodScoreType()
                if (that.edit_target_data.year_data == undefined) {
                    that.edit_target_data.year_data = {}
                    that.edit_target_data.year_data['months_target'] = that.edit_target_data.months_target;
                } else {
                    if (that.edit_target_data.year_data.months_target == undefined) {
                        that.edit_target_data.year_data['months_target'] = that.edit_target_data.months_target;
                    }else {
                        that.edit_target_data.year_data.months_target = that.edit_target_data.months_target;
                    }
                }
                // lấy các target quý
                if (this.is_correct_follow_score_calculation_type ) {
                    // check input đúng với phương pháp đo thi được request lên
                    let jqxhr = that.updateTarget(that.edit_target_data, that.indexKpi)
                        jqxhr.done(function () {
                            that.showmodal = false
                        })
                } else {
                }
            },
            checkValidate: function(total_year_follow_quarter,totalQuarterArray,sum_year){
                // param_1 tổng các quý theo phương pháp phân bố sum, most_recent, average
                // param_2 mảng tổng các tháng trong 1 quý theo phương pháp phân bổ chỉ tiêu
                // param_3 tổng 12 tháng + 4 quý
                // return true false -- true là đúng theo format phương pháp phân bổ chỉ tiêu
                var self = this;
                // Initialize pre condition
                var obj_number = {
                    '1': 'one',
                    '2': 'two',
                    '3': 'three',
                    '4': 'four'
                }
                var quarterNeedTocheckSample = [1,2,3,4]
                var intQuarterNumber = parseInt(this.edit_target_data.current_quarter)
                var quarterNeedToCheck = []

                // Exclude cac thang qua khu
                quarterNeedTocheckSample.map(function(element){
                    if (element >= intQuarterNumber) {
                        quarterNeedToCheck.push(element)
                    }
                    return element
                })

                // Process conditions

                // year target bang voi tong target cac quy
                var yearTargetValid = self.edit_target_data.year_target == total_year_follow_quarter
                var isTotalYear = total_year_follow_quarter
                if(!yearTargetValid){
                    self.error_input['year'] = true
                }

                // tong cac quy tuong ung (truyen vao tu parameters va trong year target) bang nhau
                var quartersValid = quarterNeedToCheck.reduce(function(prevVal, element){
                    console.log(totalQuarterArray[element - 1])
                    console.log(self.edit_target_data["quarter_" + element])
                    if((self.edit_target_data['quarter_' + obj_number[element] + '_target'] == totalQuarterArray[element - 1]) == false){
                        // show message lỗi
                        self.error_input['quarter_' + element] = true

                    }
                    return prevVal && (self.edit_target_data['quarter_' + obj_number[element] + '_target'] === totalQuarterArray[element - 1])
                },true)


                // tong cac quy và tháng tat cac deu bang null => user chua nhap
                var quarterSumsIsNull = sum_year == null
                if (quarterSumsIsNull){
                    self.error_input['year'] = false
                }
                return (yearTargetValid && quartersValid) || quarterSumsIsNull
            },
            calculationScore: function(){
                // input data 12 tháng và 4 quy
                // return 1 mảng chứ total 4 quy, và total 3 tháng trong 1 quý
                var self = this
                var data_quarter = [] // mang luu data 12 tháng convert thành kiểu float
                var all_quarter = [] //  mang luu data 4 quý tháng convert thành kiểu float
                var total_quarter =[] // mamg chứ total 4 quý 12 tháng theo pp phân bổ chỉ tiêu
                var obj_number = {
                    '1': 'one',
                    '2': 'two',
                    '3': 'three',
                    '4': 'four'
                }
                // step 1 chuyển data thành kiểu float đê có thể tính toán
                self.edit_target_data.year_target = $.isNumeric(self.edit_target_data.year_target)?parseFloat(self.edit_target_data.year_target):null
                for (var i =1; i<5;i++){
                    data_quarter[i] = {}
                    // mảng chứa data 4 quý
                    all_quarter[i] = self.edit_target_data['quarter_' +obj_number[i]+'_target'] = $.isNumeric(self.edit_target_data['quarter_' +obj_number[i]+'_target'])?parseFloat(self.edit_target_data['quarter_' +obj_number[i]+'_target']):null
                    console.log(i)
                    // chứa data 3 tháng sắp xếp theo quý
                    data_quarter[i]['month_1_target'] = self.edit_target_data.months_target['quarter_' +i].month_1_target = $.isNumeric(self.edit_target_data.months_target['quarter_' +i].month_1_target)?parseFloat(self.edit_target_data.months_target['quarter_' +i].month_1_target):null
                    data_quarter[i]['month_2_target'] = self.edit_target_data.months_target['quarter_' +i].month_2_target = $.isNumeric(self.edit_target_data.months_target['quarter_' +i].month_2_target)?parseFloat(self.edit_target_data.months_target['quarter_' +i].month_2_target):null
                    data_quarter[i]['month_3_target'] = self.edit_target_data.months_target['quarter_' +i].month_3_target = $.isNumeric(self.edit_target_data.months_target['quarter_' +i].month_3_target)?parseFloat(self.edit_target_data.months_target['quarter_' +i].month_3_target):null
                }
                // step 2 tính toán total 4 quý và 12 tháng theo 3 pp phân bổ sum, average, most_recent_quarter
                total_quarter[0] = calculateYearTotal(all_quarter)
                for(var i = 1; i < 5; i ++){
                    total_quarter[i] = calculationQuarterTotal(data_quarter[i])
                }
                var total_year = total_quarter.slice().reduce(function (preVal,element) {
                    if(element.sum != null){
                        return preVal + element.sum
                    }
                    return preVal
                }, null)
                total_quarter.push(total_year)
                return total_quarter
            },
            checkMethodScoreType: function () {
                var self = this
                var total_quarter_array = self.calculationScore()
                console.log(total_quarter_array)
                var sum_year = total_quarter_array[5]
                if (this.optionEditTarget) {// check co rằng buộc chỉ tiêu nếu có rằng buộc thí check input theo đúng phương phap đo
                    switch (self.edit_target_data.score_calculation_type) {
                        case "sum":
                            var sum_quarter = total_quarter_array[0].sum
                            var sum_month_follow_quarter_array = [total_quarter_array[1].sum,total_quarter_array[2].sum,total_quarter_array[3].sum,total_quarter_array[4].sum]
                            // par_1 là quarter_1 + quarter_2 + quarter_3 + quarter_4
                            // par_2 là array tông [sum_quarter_1,sum_quarter_2,sum_quarter_3,sum_quarter_4] với sum_quarter_1 = month_1 +month_2 + month_3
                            // par_3 tổng 12 tháng + 4 quý
                             self.is_correct_follow_score_calculation_type = self.checkValidate(sum_quarter,sum_month_follow_quarter_array,sum_year)
                            break;
                        case "most_recent":
                            var most_recent_quarter = total_quarter_array[0].most_recent_quarter;
                            var most_recent_month_follow_quarter_array = [total_quarter_array[1].most_recent_quarter,total_quarter_array[2].most_recent_quarter,total_quarter_array[3].most_recent_quarter,total_quarter_array[4].most_recent_quarter]
                            // par_1 là quý có input gần nhất
                            // par_2 là array các quý lấy tháng có input gần nhất
                            // par_3 tổng 12 tháng + 4 quý
                            self.is_correct_follow_score_calculation_type = self.checkValidate(most_recent_quarter,most_recent_month_follow_quarter_array,sum_year)
                            break;
                        case "average":
                             var average_quarter = total_quarter_array[0].average;
                             var average_month_follow_quarter_array = [total_quarter_array[1].average,total_quarter_array[2].average,total_quarter_array[3].average,total_quarter_array[4].average]
                            // par_1 là trung binh các quý có input
                            // par_2 là array các quý lấy trung binh các tháng
                            // par_3 tổng 12 tháng + 4 quý
                            self.is_correct_follow_score_calculation_type = self.checkValidate(average_quarter,average_month_follow_quarter_array,sum_year)
                            break;
                        default:
                            self.is_correct_follow_score_calculation_type = false
                    }
                }
            },
        }
    })
var targetPage = new Vue({
    delimiters: ['${', '}$'],
    el: '#target',
    data: {
        loading:false,
        actorId: COMMON.ActorId,
        user_viewed_id :COMMON.UserViewedId,
        user_viewed_name: COMMON.UserViewedDisplayName,
        user_viewed_email: COMMON.UserViewedEmail,
        enableFollowTarget: false,
        allow_edit_monthly_target:false,
        is_user_system:false,
        nameKPIEdit: "",
        get_current_quarter:"",
        selected_kpi:{},
        dialogFormVisible: false,
        dialogFormVisible_1: false,
        option: '',
        oldQuery: '',
        query: "",
        user_profile:{},
        user_profile_actor:{},
        isShowMonth: true,
        currentUserId: '',
        kpiList: {},
        groupFinancial: [],
        groupCustomer: [],
        groupInternal: [],
        groupLearn: [],
        groupMore: [],
        tableData: [],
        total_weight: '',
        storage_user: [],
        list_user_searched: [],
        list_surbodinates_user_viewed: [],
        organization: {},
    },
    components: {},
    computed: {
        dataToSearch: function () {
            return this.mergeSubordinateAndUserSearchList()
        },
    },
    provide: function () {
        return {
            updateTarget: this.updateTarget
        }
    },
    methods: {
        check_paste: function (evt) {
            evt.preventDefault();
            evt.stopPropagation();
        },
        check_number: function(e){
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
        refreshHistoryData: function () {
            var self = this;
            self.$set(self, 'storage_user', self.getHistoryStorageByEmail(this.user_viewed_email))
        },
        cloneObject: function (objectOriginal) {
            return JSON.parse(JSON.stringify(objectOriginal))
        },
        mergeSubordinateAndUserSearchList: function () {
            var self = this;
            var includedUserID = self.list_user_searched.filter(function (elm) {
                var subordinateID = self.list_surbodinates_user_viewed.slice().map(function (elm) {
                    return parseInt(elm.user)
                })
                return subordinateID.indexOf(parseInt(elm.user_id)) !== -1
            }).map(function (elm) {
                return parseInt(elm.user_id)
            })
            var userListFromSubordinate = self.list_surbodinates_user_viewed.slice().filter(function (elm) {
                return includedUserID.indexOf(parseInt(elm.user)) === -1
            })
            var result = self.list_user_searched.slice()
            userListFromSubordinate.map(function (elm) {
                elm.user_id = elm.user
                result.push(self.cloneObject(elm))
            })
            return result;

        },
        checkUserExistedInSearchHistory: function (userID, searchHistoryArray) {
            var that = this;
            var result = searchHistoryArray.filter(function (elm) {
                return parseInt(elm.user_id) === parseInt(userID)
            })
            return result.length > 0;
        },
        selectView: function (e) {
            this.option = $(e.target).text()
            this.isShowMonth = $(e.target).attr('data-select') == 0;
        },
        setLocalStorageByKey: function (key, object) {
            localStorage.setItem(key, JSON.stringify(object));
        },
        getLocalStorageByKey: function (key) {
            return JSON.parse(localStorage.getItem(key))
        },
        getHistoryStorageByEmail: function (userEmail) {
            var self = this;
            var _all = [];
            var _storage = []
            // Step 1: fetch and construct data for history search email and history search object

            // 1. Fetch and construct history_search_u
            var historyArray = self.getLocalStorageByKey('history_search_u');
            var user_current = historyArray !== null ? historyArray : [];


            // 2. Fetch and construct history_search
            var historySearchAll = self.getLocalStorageByKey('history_search');
            _all = historySearchAll !== null ? historySearchAll : [];

            // Step 2: get user search history, init default if user don't have any data yet

            // 1. Construct default for history_search and history_search_u
            // Make sure history_search and history_search_u have the same number of elements
            // and same order followed by email
            var position = user_current.indexOf(userEmail);
            if (position === -1) {
                user_current.push(userEmail);
                _all.push(_storage)
                self.setLocalStorageByKey('history_search', _all);
                self.setLocalStorageByKey('history_search_u', user_current);
            }


            // 2. Get user search history by exact email
            position = user_current.indexOf(userEmail);
            var userSearchArray = _all[position];
            _storage = (userSearchArray !== undefined) ? userSearchArray : [];
            return _storage

        },
        setHistoryStorageByEmail: function (userEmail, storage) {
            var self = this;

            // Trigger to make sure already have data
            self.getHistoryStorageByEmail(userEmail);

            // 1. Fetch and construct history_search_u
            var historyArray = self.getLocalStorageByKey('history_search_u');
            var user_current = historyArray !== null ? historyArray : [];


            // 2. Fetch and construct history_search
            var historySearchAll = self.getLocalStorageByKey('history_search');
            var _all = historySearchAll ? historySearchAll : [];

            // Step 2: get user search history, init default if user don't have any data yet

            // 1. Construct default for history_search and history_search_u
            // Make sure history_search and history_search_u have the same number of elements
            // and same order followed by email
            var position = user_current.indexOf(userEmail);

            // Make sure data already have
            // 3: Limit search history at 3 user Objec

            var _storage = storage.slice()
            if (_storage.length > 3)
                _storage.splice(3, storage.length - 3);


            _all[position] = _storage
            self.setLocalStorageByKey('history_search', _all);


        },
        setCurrentUser: function (userId, userName) { //get user khi search
            var self = this
            self.query = userName
            self.oldQuery = userName
            self.tableData = []
            self.currentUserId = userId;

            var _storage = self.getHistoryStorageByEmail(this.user_viewed_email)

            // Step 3: Update search history

            // 1. Check if selected user were in the history search yet
            var userExisted = self.checkUserExistedInSearchHistory(userId, _storage)

            var indexOfSearchedUser = self.dataToSearch.map(function (elm) {
                return elm.user_id
            }).indexOf(parseInt(userId));


            // 2. If history search don't have user selected, insert user selected into history search
            if (userExisted === false && indexOfSearchedUser !== -1) {
                _storage.insert(0, self.dataToSearch[indexOfSearchedUser])
            }
            // 3: Limit search history at 3 user Objec
            if (_storage.length > 3)
                _storage.splice(3, 1);


            // Step 4: update to localStorage again
            self.setHistoryStorageByEmail(this.user_viewed_email, _storage)

            self.getCurrentQuarter();
            self.getUserProfile();
            self.refreshHistoryData()
        },
        arraySpanMethod: function ({row, column, rowIndex, columnIndex}) {// merge cac cell cua row category
            if (this.tableData[rowIndex].isGroup == true) {
                if (this.isShowMonth) {
                    return [1, 19];
                } else {
                    return [1, 7]
                }
            }
        },
        tableRowClassName: function ({row, rowIndex}) { // add class cho category
            var list_classes = [];
            if (this.tableData[rowIndex].isGroup == true) {
                if (this.tableData[rowIndex].name == gettext('Financial')) {
                    list_classes.push('target_fin_title');
                } else if (this.tableData[rowIndex].name == gettext('Customer')) {
                    list_classes.push('target_client_title');
                }
                else if (this.tableData[rowIndex].name == gettext('Internal')) {
                    list_classes.push('target_internal_title');
                }
                else if (this.tableData[rowIndex].name == gettext('Learninggrowth')) {
                    list_classes.push('target_clean_title');
                }
                else if (this.tableData[rowIndex].name == gettext('More')) {
                    list_classes.push('target_other_title');
                } else {
                }
            }
            if (row.weight == 0) {
                list_classes.push("disabled-edit-year-data");
            }
            return list_classes.join(" ");
        },
        createItem: function (item) { // created data cho tung kpi
            var self = this;
            var tempTableData = {
                id: '',
                disable_edit:'',
                current_quarter:'',
                name: '',
                year_target: '',
                months_target: {},
                quarter_one_target: "",
                quarter_two_target: "",
                quarter_three_target: "",
                quarter_four_target: "",
                isGroup: false,
                score_calculation_type: "",
                year_data: {},
                visible2: false,
                refer_to:'',
                name_kpi_parent:"",
            };
            tempTableData = Object.assign(tempTableData,item);
            // add field to export excel
            // tempTableData.code = item.code == undefined ? "" : item.code;
            // tempTableData.group = item.group == undefined ? "" : item.group;
            if (item.parent){
                tempTableData.weight_child = item.weight == undefined ? 0 : item.weight;
            }
            tempTableData.edit = "";
            tempTableData.isGroup = item.isGroup == undefined ? false : true
            // biến sử dung truyền khi request lên server
            tempTableData.disable_edit = !self.checkPermissionToEditTarget(item)
            tempTableData.current_quarter = self.get_current_quarter
            tempTableData.months_target = self.getMonthsTarget(item) == undefined ? "" : self.getMonthsTarget(item);
            return tempTableData
        },
        triggeredDismissModal: function(e){
            this.selected_kpi = Object.assign(this.selected_kpi, e) // gan e cho vung nho this.selected_kpi
            this.selected_kpi = e
            this.dialogFormVisible = false
            //this.$set(this,'selected_kpi',JSON.parse(JSON.stringify({})))
        },
        showModalEdit: function(kpi){
            // console.log('triggered show modal')
            this.$set(this,'selected_kpi', kpi)
            this.dialogFormVisible = true
        },
        getMonthsTarget: function (item) { // tao field thang theo tung quy
            var temp_months_target = {
                quarter_1: {
                    month_1_target: '',
                    month_2_target: '',
                    month_3_target: ''
                },
                quarter_2: {
                    month_1_target: '',
                    month_2_target: '',
                    month_3_target: ''
                },
                quarter_3: {
                    month_1_target: '',
                    month_2_target: '',
                    month_3_target: ''
                },
                quarter_4: {
                    month_1_target: '',
                    month_2_target: '',
                    month_3_target: ''
                }
            }
            if (item.year_data != undefined && item.year_data.months_target) {
                Object.keys(temp_months_target).forEach(function (quarter) {
                    Object.assign(temp_months_target[quarter], item.year_data.months_target[quarter] || {});
                })

            }
            // var i = this.get_current_quarter
            // temp_months_target['quarter_' + i].month_1_target = item.month_1_target == undefined ? "" : item.month_1_target;
            // temp_months_target['quarter_' + i].month_2_target = item.month_2_target == undefined ? "" : item.month_2_target;
            // temp_months_target['quarter_' + i].month_3_target = item.month_3_target == undefined ? "" : item.month_3_target;
            return temp_months_target
        },

        getUserProfile: function () {
            var self = this;
            cloudjetRequest.ajax({
                type: "GET",
                url: '/api/profile/?user_id=' + self.currentUserId,
                success: function (data) {
                    self.user_profile = data
                },
            })
        },
        getProfileActor: function () {
            var self = this
            cloudjetRequest.ajax({
                type: "GET",
                url: '/api/profile/?user_id=' + self.actorId,
                success: function (data) {
                    self.user_profile_actor = data;
                    self.is_user_system = data.is_admin || data.is_superuser? true : false;
                    return data
                },
            })
        },
        getOrg: function () {
            self = this;
            cloudjetRequest.ajax({
                method: "GET",
                url: "/api/organization",
                success: function (data) {
                    if (data) {
                        self.organization = data;
                        self.enableFollowTarget = data.enable_require_target
                    }
                },
                error: function () {
                }
            });
        },
        checkPermissionToEditTarget: function (kpi) {
            var logic_object = {is_user_system :this.is_user_system,
                enable_edit: kpi.enable_edit,
                allow_edit_monthly_target: this.organization.allow_edit_monthly_target,
                enable_to_edit: this.organization.enable_to_edit}
            var result_permission = pemission_edit_kpi(logic_object)
            return result_permission
        },
        disableToEditTarget: function (target_kpi,quarter_to_edit) {
            if (quarter_to_edit < target_kpi.current_quarter) return true
            return target_kpi.disable_edit
        },

        getCurrentQuarter: function() {
            let that = this
            cloudjetRequest.ajax({
                url: "/api/quarter/",
                dataType: "json",
                type: "GET",
                data: {
                    get_current_quarter: true
                },
                success: function (res) {
                    // console.log("quarter")
                    console.log(res);
                    that.$set(that.$data, 'get_current_quarter', res.fields.quarter);
                    // console.log(this.get_current_quarter)
                    that.getListKpi()
                },
                error: function (a, b, c) {
                }
            })
        },
        updateTarget: function (kpi,index) { // update target khi edit tung field kpi
            var that = this;
            if (kpi.year_data == undefined) {
                kpi.year_data = {}
                kpi.year_data['months_target'] = kpi.months_target;
            } else {
                if (kpi.year_data.months_target == undefined) {
                    kpi.year_data['months_target'] = kpi.months_target;
                } else {
                    kpi.year_data.months_target = kpi.months_target;
                }
            }
            var jqXhr = cloudjetRequest.ajax({
                type: 'post',
                url: '/api/v2/kpi/',
                dataType: "json",
                data: JSON.stringify({
                    id: kpi.id,
                    score_calculation_type: kpi.score_calculation_type,
                    year_target: $.isNumeric(kpi.year_target) ? parseFloat(kpi.year_target) : null,
                    quarter_one_target: $.isNumeric(kpi.quarter_one_target )? parseFloat(kpi.quarter_one_target):null,
                    quarter_two_target: $.isNumeric(kpi.quarter_two_target)?  parseFloat(kpi.quarter_two_target):null,
                    quarter_three_target: $.isNumeric(kpi.quarter_three_target)? parseFloat(kpi.quarter_three_target):null,
                    quarter_four_target: $.isNumeric(kpi.quarter_four_target)? parseFloat(kpi.quarter_four_target):null,
                    year_data: kpi.year_data
                }),
                success: function (result) {
                    // console.log("===================success============")
                    // console.log(result)
                    that.tableData[index] = Object.assign(that.tableData[index],result)
                    that.$set(that.tableData[index], 'months_target' , that.getMonthsTarget(result))
                    // that.$set(that.tableData, index, result)
                    kpi.visible2 = false;
                    $('.el-popover').hide()
                },
                error: function () {
                    $('.el-popover').hide()
                }
            })
            return jqXhr
        },
        cancelEditTarget: function () {
            $('.el-popover').hide()
        },
        getListKpi: function () { // sap xep kpi theo category
            var self = this
            self.loading = true
            cloudjetRequest.ajax({
                type: 'GET',
                url: '/api/v2/user/' + this.currentUserId + '/kpis/?include_childs=1&order_by_group_kpi=1',
                success: function (result) {

                    self.kpiList = result.map(function(elmParent){
                        elmParent.children = elmParent.children.filter(function(elm){
                            return parseInt(elm.user) === parseInt(self.currentUserId)
                        });
                        return elmParent
                    })
                    // kpiList chỉ chứa các kpi của user_view đang đảm nhiệm
                    self.kpiList = result
                    self.groupFinancial = []
                    self.groupCustomer = []
                    self.groupInternal = []
                    self.groupLearn = []
                    self.groupMore = []
                    if (self.kpiList != null) {
                        for (var i = 0; i < self.kpiList.length; i++) {
                            self.createdKpiForCategory(self.kpiList[i])
                        }
                    }
                    // console.log("==========>>>><<<<<<<<==========")
                    // console.log(self.groupFinancial)
                    // console.log(self.groupCustomer)
                    // console.log(self.groupInternal)
                    // console.log(self.groupLearn)
                    // console.log(self.groupMore)
                    //                             Array.prototype.pushArray = function() {
                    //    var toPush = this.concat.apply([], arguments);
                    //     for (var i = 0, len = toPush.length; i < len; ++i) {#}
                    //         this.push(toPush[i]);#}
                    //
                    // ;
                    if (self.groupFinancial.length > 0) {
                        self.tableData.push(self.createItem({name: gettext('Financial'), isGroup: true}));
                        self.tableData.push.apply(self.tableData, self.tableData.concat.apply([], self.groupFinancial));
                    }
                    if (self.groupCustomer.length > 0) {
                        self.tableData.push(self.createItem({name: gettext('Customer'), isGroup: true}));
                        self.tableData.push.apply(self.tableData, self.tableData.concat.apply([], self.groupCustomer));
                    }
                    if (self.groupInternal.length > 0) {
                        self.tableData.push(self.createItem({name: gettext('Internal'), isGroup: true}));
                        self.tableData.push.apply(self.tableData, self.tableData.concat.apply([], self.groupInternal));
                    }
                    if (self.groupLearn.length > 0) {
                        self.tableData.push(self.createItem({name: gettext('Learninggrowth'), isGroup: true}));
                        self.tableData.push.apply(self.tableData, self.tableData.concat.apply([], self.groupLearn));
                    }
                    if (self.groupMore.length > 0) {
                        self.tableData.push(self.createItem({name: gettext('More'), isGroup: true}));
                        self.tableData.push.apply(self.tableData, self.tableData.concat.apply([], self.groupMore));
                    }
                    // console.log(self.tableData)
                    self.loading = false
                },

                error: function (a, b, c) {
                    self.loading = false
                }

            })
        },
        createdKpiForCategory: function (kpi) {
            var self = this
            var temp = []
            temp.push(self.createItem(kpi));
            var email_parent = kpi.incharge_user_email
            if(kpi.children.length >0){
                for(var i = 0; i < kpi.children.length; i++){
                    if(email_parent === kpi.children[i].incharge_user_email){
                        temp.push(self.createItem(kpi.children[i]));
                    }
                }
            }
            temp = temp.map(function (element) {
                element.name_kpi_parent = kpi.name
                return element
            })
            if (kpi.bsc_category == 'financial') {
                //self.groupFinancial.push(temp)
                self.groupFinancial.push.apply(self.groupFinancial, self.groupFinancial.concat.apply([], temp));
            } else if (kpi.bsc_category == 'customer') {
                self.groupCustomer.push.apply(self.groupCustomer, self.groupCustomer.concat.apply([], temp));
            } else if (kpi.bsc_category == 'internal') {
                self.groupInternal.push.apply(self.groupInternal, self.groupInternal.concat.apply([], temp));
            } else if (kpi.bsc_category == 'learninggrowth') {
                self.groupLearn.push.apply(self.groupLearn, self.groupLearn.concat.apply([], temp));
            } else if (kpi.bsc_category == 'other') {
                self.groupMore.push.apply(self.groupMore, self.groupMore.concat.apply([], temp));
            } else {
            }
        },
        search_user_limit: function () {
            var that = this;
            clearTimeout(that.timeout);
            that.timeout = setTimeout(function () {
                if (that.query.length > 1) {
                    $(".arrow-up").hide();
                    $("#list_user_suggest").hide();
                    $("#result_searched").show();
                    $("#ico-clear").show();
                    $("#ico-search").hide();
                    $("#popup-progress").hide();
                    cloudjetRequest.ajax({
                        method: "GET",
                        dataType: 'json',
                        url: "/api/v2/searchable_peoplelist" + '?all_sublevel=1&limit=10&search_term=' + that.query,
                        success: function (data) {
                            that.list_user_searched = data.suggestions;
                            // console.log(that.list_user_searched);
                            // self.quarter_period = [];
                            // self.user_profile = null;
                            if (that.list_user_searched < 1) {
                                $(".no-data").show();
                            }
                            else {
                                $(".no-data").hide();
                            }
                            $(".arrow-up").show();
                        }
                    })
                } else {
                    $("#list_user_suggest").show();
                    that.list_user_searched = [];
                    $(".no-data").hide();
                    $(".arrow-up").show();
                    $("#ico-clear").hide();
                    $("#ico-search").show()
                }
            }, 300);
        },
        get_surbodinate_user_viewed: function () {
            var that = this;
            cloudjetRequest.ajax({
                method: "GET",
                dataType: 'json',
                url: '/api/team/?user_id=' + that.user_viewed_id,
                success: function (data) {
                    // console.log(data)
                    that.list_surbodinates_user_viewed = data.length > 0 ? data : [];
                    this.has_manage = that.list_surbodinates_user_viewed.length > 0
                    // console.log("=============surbodinate user==========")
                    // console.log(this.has_manage)
                }
            })
        },

        downloadFile: function (wb, filename) {
            if (wb) wb.xlsx.writeBuffer().then(function (buffer) {
                var filesaver = saveAs(new Blob([buffer], {
                    type: "application/octet-stream"
                }), filename);
            });
        },

        get_simple_kpi: function () {
            var self = this;
            var wb = new ExcelJS.Workbook();
            wb.creator = 'Cloudjet';
            var ws = wb.addWorksheet('KPI',{pageSetup:{showGridLines:true,orientation:'landscape',paperSize: 9,fitToPage: true, fitToHeight: 0, fitToWidth: 1}});
            ws.pageSetup.margins = {
                left: 0.1, right: 0.1,
                top: 0.2, bottom: 0.2,
                header: 0.3, footer: 0.3
            };

            var headerData = {
                row: 9,
                height: 20,
                columns: [{
                    id: null,
                    child: null,
                    text: gettext('KPI Code'),
                    slug: 'kpi_id',
                    width: '20',
                    style: 'center'
                }, {
                    id: null,
                    child: null,
                    text: gettext('Group'),
                    slug: 'refer_group_name',
                    width: '20',
                    style: 'center'
                }, {
                    id: null,
                    child: null,
                    text: gettext('KPI name'),
                    slug: 'name',
                    width: '20',
                    style: {
                        alignment: {
                            vertical: 'middle',
                            horizontal: 'left',
                            wrapText: true
                        },
                    }
                }, {
                    id: null,
                    child: null,
                    text: gettext('Weight'),
                    slug: 'weight',
                    width: '20',
                    style: 'center'
                }, {
                    id: null,
                    child: null,
                    text: gettext('% Weight'),
                    slug: 'weight_percent',
                    width: '20',
                    style: 'center'
                }, {
                    id: null,
                    child: null,
                    text: gettext('Assign to'),
                    slug: 'incharge_user_email',
                    width: '25',
                    style: {
                        alignment: {
                            vertical: 'middle',
                            horizontal: 'left',
                            wrapText: true
                        },
                    }
                }, {
                    id: null,
                    child: null,
                    text: gettext('Weight child'),
                    slug: 'weight_child',
                    width: '20',
                    style: 'center'
                }, {
                    id: null,
                    child: null,
                    text: gettext('% Weight child'),
                    slug: 'weight_child_percent',
                    width: '20',
                    style: 'center'
                }, {
                    id: null,
                    child: null,
                    text: gettext('Unit'),
                    slug: 'unit',
                    width: '20',
                    style: 'center'
                }, {
                    id: null,
                    child: null,
                    text: gettext('Measurement'),
                    slug: 'current_goal',
                    width: '20',
                    style: {
                        alignment: {
                            vertical: 'middle',
                            horizontal: 'left',
                            wrapText: true
                        },
                    }
                }, {
                    id: null,
                    child: null,
                    text: gettext('Data source'),
                    slug: 'data_source',
                    width: '20',
                    style: 'center'
                }, {
                    id: null,
                    child: null,
                    text: gettext('Operator'),
                    slug: 'operator',
                    width: '20',
                    style: 'center'
                },{
                    id: null,
                    child: null,
                    text: gettext('Target alignment'),
                    slug: 'score_calculation_type',
                    width: '20',
                    style: 'center'
                },{
                    id: null,
                    text: gettext('Target'),
                    slug: 'target',
                    width: '20',
                    style: 'center',
                    child: [
                        {
                            text: gettext("Year"),
                            slug: 'year_target',
                            width: '20',
                            style: 'center',
                        },{
                            text: gettext("Month 1"),
                            slug: 'months_target.quarter_1.month_1_target',
                            width: '20',
                            style: 'center',
                        },{
                            text: gettext("Month 2"),
                            slug: 'months_target.quarter_1.month_2_target',
                            width: '20',
                            style: 'center',
                        },{
                            text: gettext("Month 3"),
                            slug: 'months_target.quarter_1.month_3_target',
                            width: '20',
                            style: 'center',
                        },{
                            text: gettext("Quarter 1"),
                            slug: 'quarter_one_target',
                            width: '20',
                            style: 'center',
                        },{
                            text: gettext("Month 4"),
                            slug: 'months_target.quarter_2.month_1_target',
                            width: '20',
                            style: 'center',
                        },{
                            text: gettext("Month 5"),
                            slug: 'months_target.quarter_2.month_2_target',
                            width: '20',
                            style: 'center',
                        },{
                            text: gettext("Month 6"),
                            slug: 'months_target.quarter_2.month_3_target',
                            width: '20',
                            style: 'center',
                        },{
                            text: gettext("Quarter 2"),
                            slug: 'quarter_two_target',
                            width: '20',
                            style: 'center',
                        },{
                            text: gettext("Month 7"),
                            slug: 'months_target.quarter_3.month_1_target',
                            width: '20',
                            style: 'center',
                        },{
                            text: gettext("Month 8"),
                            slug: 'months_target.quarter_3.month_2_target',
                            width: '20',
                            style: 'center',
                        },{
                            text: gettext("Month 9"),
                            slug: 'months_target.quarter_3.month_3_target',
                            width: '20',
                            style: 'center',
                        },{
                            text: gettext("Quarter 3"),
                            slug: 'quarter_three_target',
                            width: '20',
                            style: 'center',
                        },{
                            text: gettext("Month 10"),
                            slug: 'months_target.quarter_4.month_1_target',
                            width: '20',
                            style: 'center',
                        },{
                            text: gettext("Month 11"),
                            slug: 'months_target.quarter_4.month_2_target',
                            width: '20',
                            style: 'center',
                        },{
                            text: gettext("Month 12"),
                            slug: 'months_target.quarter_4.month_3_target',
                            width: '20',
                            style: 'center',
                        },{
                            text: gettext("Quarter 4"),
                            slug: 'quarter_four_target',
                            width: '20',
                            style: 'center',
                        }

                    ]


                }]
            };

            var headerFormat = {
                alignment: {
                    vertical: 'middle',
                    horizontal: 'center',
                    wrapText: true
                },
                font: {
                    name: 'Arial',
                    size: 12,
                    color: {
                        argb: 'FFFFFFFF'
                    },
                    bold: true
                },
                fill: {
                    type: 'pattern',
                    pattern: 'solid',
                    bgColor: {
                        argb: '008B8B'
                    },
                    fgColor: {
                        argb: '008B8B'
                    }
                },
                border: {
                    top: {style: 'thin', color: {argb: 'FF000000'}},
                    left: {style: 'thin', color: {argb: 'FF000000'}},
                    bottom: {style: 'thin', color: {argb: 'FF000000'}},
                    right: {style: 'thin', color: {argb: 'FF000000'}}
                }
            };

            var headerInfoFormat = {
                company: {
                    alignment: {
                        vertical: 'left',
                        horizontal: 'left',
                        wrapText: true
                    },
                    font: {
                        name: 'Arial',
                        size: 18,
                        color: {
                            argb: 'FF000000'
                        },
                        bold: true
                    },
                    fill: {
                        type: 'pattern',
                        pattern: 'solid',
                        bgColor: {
                            argb: 'FFFFFFFF'
                        },
                        fgColor: {
                            argb: 'FFFFFFFF'
                        }
                    },

                },
                title: {
                    alignment: {
                        vertical: 'middle',
                        horizontal: 'center',
                        wrapText: true
                    },
                    font: {
                        name: 'Arial',
                        size: 16,
                        color: {
                            argb: 'FF000000'
                        },
                        bold: true
                    },
                    fill: {
                        type: 'pattern',
                        pattern: 'solid',
                        bgColor: {
                            argb: 'FFFFFFFF'
                        },
                        fgColor: {
                            argb: 'FFFFFFFF'
                        }
                    },

                },
                info:{
                    alignment: {
                        vertical: 'left',
                        horizontal: 'left',
                        wrapText: true
                    },
                    font: {
                        name: 'Arial',
                        size: 12,
                        color: {
                            argb: 'FF000000'
                        },
                        bold: true
                    },
                    fill: {
                        type: 'pattern',
                        pattern: 'solid',
                        bgColor: {
                            argb: 'FFFFFFFF'
                        },
                        fgColor: {
                            argb: 'FFFFFFFF'
                        }
                    },

                }
            };

            var targetFormat = {
                alignment: {
                    vertical: 'middle',
                    horizontal: 'center',
                    wrapText: true
                },
                font: {
                    name: 'Arial',
                    size: 12,
                    color: {
                        argb: 'FFFFFFFF'
                    },
                    bold: true
                },
                fill: {
                    type: 'pattern',
                    pattern: 'solid',
                    bgColor: {
                        argb: '31859B'
                    },
                    fgColor: {
                        argb: '31859B'
                    }
                },
                border: {
                    top: {style: 'thin', color: {argb: 'FF000000'}},
                    left: {style: 'thin', color: {argb: 'FF000000'}},
                    bottom: {style: 'thin', color: {argb: 'FF000000'}},
                    right: {style: 'thin', color: {argb: 'FF000000'}}
                }
            };

            var bodyFormat = {
                alignment: {
                    vertical: 'middle',
                    horizontal: 'center',
                    wrapText: true
                },
                font: {
                    name: 'Arial',
                    size: 12,
                    color: {
                        argb: 'FF000000'
                    },
                    bold: false
                },
                fill: {
                    type: 'pattern',
                    pattern: 'solid',
                    bgColor: {
                        argb: 'FFFFFFFF'
                    },
                    fgColor: {
                        argb: 'FFFFFFFF'
                    }
                },
                border: {
                    top: {style: 'thin', color: {argb: 'FF000000'}},
                    left: {style: 'thin', color: {argb: 'FF000000'}},
                    bottom: {style: 'thin', color: {argb: 'FF000000'}},
                    right: {style: 'thin', color: {argb: 'FF000000'}}
                }
            };
            console.log("header data:", headerData);

            // hidden column A
            ws.getColumn('A').hidden = true;

            var end_column = 'AE';
            // merge cell company name
            ws.mergeCells('B1:' + end_column + '1');
            // cell title
            ws.mergeCells('B2:' + end_column + '5');
            // cell title display_name
            ws.mergeCells('B6:C6');
            // cell title employee_code
            ws.mergeCells('B7:C7');
            // cell title email
            ws.mergeCells('B8:C8');
            // cell display_name
            ws.mergeCells('D6:' + end_column + '6');
            // cell employee_code
            ws.mergeCells('D7:' + end_column + '7');
            // cell email
            ws.mergeCells('D8:' + end_column + '8');
            // set value
            setCellVal('B1', self.organization.name);
            setCellVal('B2', 'BẢNG CHỈ TIÊU CÁ NHÂN');
            // full name
            setCellVal('B6', gettext('Full name'));
            setCellVal('D6', self.user_profile.display_name);
            // employee_code
            setCellVal('B7', gettext('Employee code'));
            setCellVal('D7', self.user_profile.employee_code);
            // email
            setCellVal('B8', 'Email');
            setCellVal('D8', self.user_profile.email);


            // set format
            setFormatCell('B1', headerInfoFormat.company);
            setFormatCell('B2', headerInfoFormat.title);
            setFormatCell('B6', headerInfoFormat.info);
            setFormatCell('D6', headerInfoFormat.info);

            setFormatCell('B7', headerInfoFormat.info);
            setFormatCell('D7', headerInfoFormat.info);

            setFormatCell('B8', headerInfoFormat.info);
            setFormatCell('D8', headerInfoFormat.info);

            renderHeader(headerData, headerFormat);
            totalWeight(this.tableData);
            renderData(this.tableData, headerData);



            function renderHeader(headerData, headerFormat) {
                row = headerData.row;
                var id_start = 'B';
                ws.getRow(row).height = headerData.height;
                headerData.columns.forEach(function (col, index) {
                    setWidthCol(id_start, col.width);
                    cell = id_start + row;
                    if (col.child){
                        setValueCell(cell, col.text);                   // set value target
                        setFormatCell(cell, headerFormat);
                        var row_child = row + 1;                         // merge cell target
                        ws.mergeCells(cell + ':' + (end_column + row));
                        col.child.forEach(function (child) {            // render year target -> month target
                            cell_child = id_start + row_child;
                            setWidthCol(id_start, child.width);
                            setValueCell(cell_child, child.text);
                            setFormatCell(cell_child, targetFormat);
                            id_start = id_start.nextChar();
                        })
                    }else{
                        ws.mergeCells(id_start + '9:' + id_start + '10');
                        setFormatCell(cell, headerFormat);
                        setValueCell(cell, col.text);
                    }
                    id_start = id_start.nextChar();
                });
            }


            // https://stackoverflow.com/questions/24221803/javascript-access-object-multi-level-property-using-variable
            function resolve(obj, path){
                if (path == 'weight_percent'){
                    return 'weight_percent'
                }
                if (path == 'weight_child_percent'){
                    return 'weight_child_percent'
                }
                path = path.split('.');
                var current = obj;
                while(path.length) {
                    if(typeof current !== 'object') return undefined;
                    current = current[path.shift()];
                }
                return current;
            }

            function totalWeight(tableData) {
                total = 0;
                tableData.forEach(function (row) {
                    if (row.weight != undefined && !row.parent){
                        total = total + row.weight;
                    }
                    this.total_weight = total;
                })
            }

            function renderData(tableData, headerData) {
                var start_row = 11;
                var data_start_row = 11
                var number_category = 0
                var id_start = 'B';
                var val = '';
                var total_weight_percent = 0;
                var start_row_merge_group = 0;
                var end_row_merge_group = 0;
                var is_same_group = false;
                var ready_merge_group = false
                tableData.forEach(function (row) {
                    if(row.isGroup){
                        number_category++
                    }
                    if (!row.isGroup){
                        headerData.columns.forEach(function (col) {
                            setWidthCol(id_start, col.width);
                            cell = id_start + start_row;
                            if (col.child) {
                                col.child.forEach(function (child) {            // render cell year target -> cell quarter 4 target
                                    cell = id_start + start_row;
                                    val = resolve(row, child.slug);
                                    setCellVal(cell, val);
                                    setFormatCell(cell, bodyFormat);
                                    id_start = id_start.nextChar();             // sang chu tiep thep eg: A -> B
                                })
                            } else {
                                val = resolve(row, col.slug);
                                if (col.slug == 'score_calculation_type'){
                                    val = gettext(val);
                                    console.log("type:", val);
                                } else if (col.slug == 'refer_group_name') {
                                    if (row.parent){
                                        if(!is_same_group){
                                            start_row_merge_group = id_start + (start_row -1);
                                        }

                                        val = ''
                                        is_same_group = true

                                    }else if (is_same_group && !row.parent){
                                        is_same_group = false
                                        end_row_merge_group = id_start + (start_row -1);
                                        ready_merge_group = true
                                    }else{
                                        //not thing
                                    }
                                }else if (val == 'weight_percent') {
                                    if (!row.parent){
                                        if (this.total_weight > 0) {
                                            val = (row.weight / this.total_weight);
                                        } else {
                                            val = null;
                                        }
                                        total_weight_percent = total_weight_percent + val;
                                        setNumFormat(cell, '0.00%')
                                    }else{
                                        val = '';
                                    }
                                } else if (col.slug == 'weight_child') {
                                    val = null;
                                    if (row.parent) {
                                        var parent = _.find(tableData, {id: row.parent});
                                        if (parent && parent.children_data && parent.children_data.children_weights) {
                                            parent.children_data.children_weights.forEach(function (child) {
                                                if (child.kpi_id == row.id) {
                                                    val = child.weight;
                                                }
                                            });
                                        }
                                    }
                                } else if (val == 'weight_child_percent'){
                                    if (row.parent){
                                        var total_weight_child = 0;
                                        var parent = _.find(tableData, {id: row.parent});
                                        if (parent && parent.children_data && parent.children_data.children_weights) {
                                            parent.children_data.children_weights.forEach(function (child) {
                                                total_weight_child += child.weight;
                                                if (row.id == child.kpi_id) {
                                                    row.weight_child = child.weight;
                                                }
                                            });
                                            if (total_weight_child > 0) {
                                                val = (row.weight_child / total_weight_child);
                                            } else {
                                                val = null;
                                            }
                                        }

                                        setNumFormat(cell, '0.00%')
                                    } else {
                                        val ='';
                                    }
                                } else if (col.slug == 'weight') {
                                    if (row.parent) {
                                        val = null
                                    } else {
                                        val = row.weight;
                                    }
                                }
                                setCellVal(cell, val);
                                setFormatCell(cell, bodyFormat);
                                setFormatCell(cell, col.style);
                                if (col.slug == 'refer_group_name' && ready_merge_group) {
                                    ws.mergeCells(start_row_merge_group+':' + end_row_merge_group);
                                    ready_merge_group = false
                                }else if( col.slug == 'refer_group_name' && is_same_group && start_row == ((tableData.length -1) + data_start_row - number_category)){
                                    //case for merge group : khi kpi cuối cùng có kpi con cần merge chung ô group lại
                                    ws.mergeCells(start_row_merge_group+':' +id_start+ start_row)
                                }

                            }
                            id_start = id_start.nextChar();

                        });
                        id_start = 'B';
                        start_row++;
                    }

                });
                setValueCell((id_start + start_row ), gettext('Sum'));
                setValueCell(('E' + start_row ), this.total_weight);

                setValueCell(('F' + start_row ), total_weight_percent);
                setNumFormat('F' + start_row, '0.00%');
                headerData.columns.forEach(function (col) {         // set mau dong cuoi cung
                    cell = id_start + start_row;
                    if (col.child){
                        setFormatCell(cell, headerFormat);
                        col.child.forEach(function (child) {
                            cell_child = id_start + start_row;
                            setFormatCell(cell_child, headerFormat);
                            id_start = id_start.nextChar();
                        })
                    }else{
                        setFormatCell(cell, headerFormat);
                    }
                    id_start = id_start.nextChar();
                });


            }




            var date = new Date();
            var today = self.user_profile.email + date.getDate() + '.' + parseInt(date.getMonth() + 1) + '.' + date.getFullYear();
            window.wb = wb;
            self.downloadFile(wb, today + '.xlsx');


            function setNumFormat(cell, format) {
                if (cell && format) {
                    ws.getCell(cell).numFmt = format;
                }
            }

            function setWidthCol(col, width) {
                if (col && width) ws.getColumn(col).width = width;
            }

            function setCellVal(cell, value, notWrap) {
                if (cell && value!=null)
                    ws.getCell(cell).value = value;
                if (notWrap == null)
                    ws.getCell(cell).alignment = {wrapText: true};
                else if (notWrap == true)
                    ws.getCell(cell).alignment = {wrapText: false};
            }

            function setValueCell(cell, text) {
                cell = ws.getCell(cell);

                cell.value = text;
            }

            function setCellFormat(cell, format) {
                cell = ws.getCell(cell);
                if (format) {
                    if (format.hasOwnProperty('alignment')) {
                        cell.alignment = format.alignment;
                    }
                    if (format.hasOwnProperty('font')) {
                        cell.font = format.font;
                    }
                    if (format.hasOwnProperty('fill')) {
                        cell.fill = format.fill;
                    }
                    if (format.hasOwnProperty('border')) {
                        cell.border = format.border;
                    }
                }

            }

            function setFormatCell(cell, format) {
                cell = ws.getCell(cell);
                if (format) {
                    if (format.hasOwnProperty('alignment')) {
                        cell.alignment = format.alignment;
                    }
                    if (format.hasOwnProperty('font')) {
                        cell.font = format.font;
                    }
                    if (format.hasOwnProperty('fill')) {
                        cell.fill = format.fill;
                    }
                    if (format.hasOwnProperty('border')) {
                        cell.border = format.border;
                    }
                }
            }

            function setFormatRange(fromCol, toCol, fromRow, toRow, format) {
                fromCol = fromCol.charCodeAt(0);
                toCol = toCol.charCodeAt(0);
                for (var i = fromCol; i <= toCol; i++) {
                    for (var j = fromRow; j <= toRow; j++) {
                        setCellFormat(String.fromCharCode(i) + j, format);
                    }
                }
            }



        },
    },
    created: function () {
        window.targetApp = this;
        this.option = $('#change-style-drop').children().eq(0).text();
        this.isShowMonth = true;
        this.getOrg();
        this.getProfileActor()
        this.setCurrentUser(this.user_viewed_id, this.user_viewed_name);
        this.storage_user = this.getHistoryStorageByEmail(this.user_viewed_email);
        this.get_surbodinate_user_viewed();
        setInterval(function(){
            $('#launcher').hide();
        }, 50);
    },

});
