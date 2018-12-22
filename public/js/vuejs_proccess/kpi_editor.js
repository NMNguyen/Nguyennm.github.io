// import Autocomplete from 'vuejs-auto-complete'

// https://stackoverflow.com/questions/18936915/dynamically-set-property-of-nested-object
function setObj(obj, path, value) {
    var schema = obj;  // a moving reference to internal objects within obj
    var pList = path.split('.');
    var len = pList.length;
    for(var i = 0; i < len-1; i++) {
        var elem = pList[i];
        if( !schema[elem] ) schema[elem] = {}
        schema = schema[elem];
    }

    schema[pList[len-1]] = value;
}

function kpi_ready(kpi_id, controller_prefix, ready) {
    if (ready) {
        $('#' + controller_prefix + kpi_id).show()
    }
    else {
        $('#' + controller_prefix + kpi_id).hide()
    }
}

function filter_kpi(val, parent_id) {
    var listOfObjects = [];
    var listKey = Object.keys(val);

    listKey.forEach(function (key) {
        if (parseInt(val[key].refer_to) === parseInt(parent_id) && val[key].old_weight > 0) {
            listOfObjects.push(val[key]);
        } else if (parent_id == null || listKey.indexOf(String(parent_id)) < 0) {
            // truong hop kpi cha duoc phan cong
            if (listKey.indexOf(String(val[key].refer_to)) < 0 && val[key].old_weight > 0) {
                listOfObjects.push(val[key]);
            }
        }
    });
    return listOfObjects;
}
function getKPIParentOfViewedUser(kpi_list, excludeParentID=null){
    // This function get KPI parents of user_id (user is viewed)
    var result = {};
    var filteredKPIParent = Object.values(kpi_list).filter(function(kpi){
        return kpi.parent === null && kpi.user == COMMON.UserViewedId
    })
    filteredKPIParent.map(function(kpi){
        result[kpi.id] = kpi
    });
    // NEED REMOVE excludeParentID FROM LIST
    if (excludeParentID != null){
        delete result[excludeParentID];
    }

    console.log("PARENT KPI ===========================");
    console.log(result)
    return result;
}
// Comment because this function has a performance problem
// function getKPIParent(kpi_list,excludeParentID){
//     var result = {};
//     // KPI cha duoc phan cong
//     var listKey = Object.keys(kpi_list)
//     var listKPIList = listKey.map(function(kpi_id){
//         return kpi_list[kpi_id]
//     })
//     var filteredKPIParent = listKPIList.filter(function(elm){
//         var baseCondition = excludeParentID.indexOf(elm.id) === -1 // id must not in excluded list
//         var condition2 = (
//             elm.refer_to !== null && // refer_to is not null
//             listKPIList.map(function(elm2){
//                 return parseInt(elm2.id)
//             }).indexOf(parseInt(elm.refer_to))  === -1 // and refer_to must not be in current kpi list
//         )
//         var condition1 = (elm.refer_to === null)
//         return baseCondition && (condition1 || condition2)
//     })
//     filteredKPIParent.map(function(elm){
//         result[elm.id] = Object.assign({},elm)
//     })
//     console.log("PARENT KPI ===========================")
//     console.log(result)
//     return result
// }
function calculateParentKPIWeight(kpi_list,excludeParentID){
    var result = 0;
    var dataSource = getKPIParentOfViewedUser(kpi_list, excludeParentID) // KPI cha thi moi lay
    for(var kpi_id in dataSource){
        result += parseFloat(kpi_list[kpi_id].weight)
    }
    return result
}


function total_weight_on_level(val, parent_id) {
    var total_weight = 0;
    var listKey = Object.keys(val);
    listKey.forEach(function (key) {
        if (val[key].refer_to == parent_id) {
            total_weight += Number(val[key].weight);
        } else if (parent_id == null || parent_id == "" || listKey.indexOf(String(parent_id)) < 0) {
            // truong hop kpi cha duoc phan cong
            if (listKey.indexOf(String(val[key].refer_to)) < 0 && val[key].weight > 0) {
                // truong hop kpi cha duoc phan cong
                total_weight += Number(val[key].weight);
            }
        }
    });

    return total_weight;
}

function total_old_weight_on_level(val, parent_id) {
    var total_old_weight = 0;
    var listKey = Object.keys(val);
    listKey.forEach(function (key) {
        if (val[key].refer_to == parent_id) {
            total_old_weight += Number(val[key].old_weight);
        } else if (parent_id == null || parent_id == "" || listKey.indexOf(String(parent_id)) < 0) {
            // truong hop kpi cha duoc phan cong
            if (listKey.indexOf(String(val[key].refer_to)) < 0 && val[key].old_weight > 0) {
                // truong hop kpi cha duoc phan cong
                total_old_weight += Number(val[key].old_weight);
            }
        }
    });
    return total_old_weight;
}
// function setToolTipKPI(el, content){
//     $(el).qtip({
//         content: {
//             text: content.replace(/(?:\r\n|\r|\n)/g, '<br/>')
//         },
//         style: {
//             classes: 'qtip-green'
//         },
//     });
// }


// no longer use
// function collapse_kpi_group(kpi_id, refer_to_id, get_kpi_refer_group, is_search_page) {
//
//     if ($('#kpi-wrapper-' + refer_to_id).length == 0 && is_search_page != 'True') {
//
//         if (v.toggle_states[kpi_id] == undefined) {
//             $('.kpi-child-of-' + get_kpi_refer_group).hide();
//         }
//         $('.kpi-refer-' + get_kpi_refer_group).hide();
//         $('.kpi-refer-' + get_kpi_refer_group).first().show();
//     }
// }

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

}

function updateQueryStringParameter(uri, key, value) {
    var re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
    var separator = uri.indexOf('?') !== -1 ? "&" : "?";
    if (uri.match(re)) {
        return uri.replace(re, '$1' + key + "=" + value + '$2');
    }
    else {
        return uri + separator + key + "=" + value;
    }
}

Vue.config.delimiters = ['${', '}$'];
// Vue.config.unsafeDelimiters = ['${', '}$'];
// Ignore html custom elements
// https://stackoverflow.com/questions/34037734/how-to-ignore-custom-html-tag-in-vuejs
// https://vuejs.org/v2/api/#ignoredElements
Vue.config.ignoredElements = [
    'inplaceeditform',
    /*
       'my-custom-web-component',
      'another-web-component',
      // Use a `RegExp` to ignore all elements that start with "ion-"
      // 2.5+ only
      /^ion-/
  */
];

//filter date format
Vue.filter('dateFormat', function (value) {
    var language_code = COMMON.LanguageCode;
    if (value) {
        if (language_code == 'en') return moment(value).format('DD/MMM/YYYY')
        if (language_code == 'vi') return moment(value).format('DD/MM/YYYY')
    }
});
Vue.filter('createdat_format', function (value) {
    return moment(value).format('H:mm:ss - DD/MM/YYYY')
});
Vue.filter('url_decode', function (str) {
    return decodeURIComponent(str)
});
Vue.filter('rounder', {
    // model -> view
    // formats the value when updating the input element.
    read: function (val) {
        try {
            return val.toFixed(0)
        }
        catch (err) {
            return val
        }
    }
});
Vue.filter('weightDisplay', function (val) {
    try {
        return (val.toFixed(1) == 'NaN') ? 0 + "%" : val.toFixed(1) + "%"
    }
    catch (err) {
        return val
    }

});
// Vue.filter('weightDisplay', {
//     // model -> view
//     // formats the value when updating the input element.
//     read: function (val) {
//         try {
//             return (val.toFixed(1) == 'NaN') ? 0 + "%" : val.toFixed(1) + "%"
//         }
//         catch (err) {
//             return val
//         }
//     },
//     // view -> model
//     // formats the value when writing to the data.
//     write: function (val, oldVal) {
//         var number = +val.replace(/[^\d.]/g, '')
//         return isNaN(number) ? 0 : parseFloat(number.toFixed(2))
//     }
// });
Vue.filter('weightDisplay', function (val) {
    try {
        return (val.toFixed(1) == 'NaN') ? 0 + "%" : val.toFixed(2) + "%"
    }
    catch (err) {
        return val
    }

});
// Vue.filter('scoreDisplay', {
//     // model -> view
//     // formats the value when updating the input element.
//     read: function (val) {
//         try {
//             return typeof(val) == 'number' ? (val == 0 ? "0%" : (val.toFixed(2) + "%")) : "0%";
//         }
//         catch (err) {
//             return "0%";
//         }
//     },
//     // view -> model
//     // formats the value when writing to the data.
//     write: function (val, oldVal) {
//         var number = +val.replace(/[^\d.]/g, '');
//         return isNaN(number) ? 0 : parseFloat(number.toFixed(2))
//     }
// });

Vue.filter('scoreDisplay', function (val) {
        try {
            return typeof(val) == 'number' ? (val == 0 ? "0%" : (val.toFixed(2) + "%")) : "0%";
        }
        catch (err) {
            return "0%";
        }
    }
);

Vue.filter('monthDisplay',  function (val, quarter, order) {
    try {
        var arrMonth = val.split('|');
        return (arrMonth[((quarter - 1) * 3 + order) - 1] == undefined) ? '0' : arrMonth[((quarter - 1) * 3 + order) - 1];
    }
    catch (err) {
        return val;

    }


});
//
// Vue.filter('decimalDisplay', {
//     // model -> view
//     // formats the value when updating the input element.
//     // Tuan Note:
//     // + sync number
//     // + auto automatically separate numbers when in thousands
//     // + do not let the user enter characters
//     read: function (val) {
//         return (val === 0) ? 0 : (val == null || val === '') ? '' : format(val);
//     },
//     // view -> model
//     // formats the value when writing to the data.
//     write: function (val, oldVal) {
//         if (val === '') {
//             return '';
//         }
//         else {
//             var number = val.split(",").join("");
//             number = Number(number);
//             // Toan note: ref https://stackoverflow.com/a/5963202/2599460
//             return isNaN(number) ? 0 : parseFloat(number.toFixed(4));
//         }
//     }
//
// });
Vue.filter('decimalDisplay',  function (val) {
    return (val === 0) ? 0 : (val == null || val === '') ? '' : format(val);


});



Vue.filter('filter_kpi_level', function (val) {
    var id = v.active_kpi_id;
    if (id != '' && id != undefined && parseInt(id) > 0) {
        var parent_id = val[id].refer_to;
        return filter_kpi(val, parent_id);
    }
    return val;
});

// Vue.filter('filter_total_weight', function (val) {
//     var total_weight = 0;
//     var id = v.active_kpi_id;
//     var parent_id = "";
//     if (id != '' && id != undefined && id > 0) {
//         parent_id = val[id].refer_to;
//     }
//     total_weight = total_weight_on_level(val, parent_id);
//     return total_weight;
// });
Vue.filter('filter_total_weight_exclude_delayed', function (val) {
    var total_weight = 0;
    var id = v.active_kpi_id;
    var dataSource = Object.assign({},val)
    var excludeParentID = parseFloat(id)
    total_weight = calculateParentKPIWeight(dataSource,excludeParentID);
    return total_weight;
});

Vue.filter('filter_cal_rate_weight', function (val, weight) {
    var total_weight = 0;
    var id = v.active_kpi_id;
    var dataSource = Object.assign({},val)
    var excludeParentID = parseFloat(id)
    total_weight = calculateParentKPIWeight(dataSource,excludeParentID);
    return weight * 100 / total_weight;
});

Vue.filter('filter_total_old_weight', function (val) {
    var total_old_weight = 0;
    var id = v.active_kpi_id;
    var parent_id = "";
    if (id != '' && id != undefined && id > 0) {
        parent_id = val[id].refer_to;
    }
    total_old_weight = total_old_weight_on_level(val, parent_id);
    return total_old_weight;
});

Vue.filter('filter_cal_rate_old_weight', function (val, weight) {
    var total_old_weight = 0;
    var id = v.active_kpi_id;
    var parent_id = "";
    if (id != '' && id != undefined && id > 0) {
        parent_id = val[id].refer_to;
    }
    total_old_weight = total_old_weight_on_level(val, parent_id);

    return weight * 100 / total_old_weight;
});


Vue.mixin({
    delimiters: ['${', '}$'],
    data:function(){
        // https://stackoverflow.com/questions/40896261/apply-global-variable-to-vuejs
        return {

            is_user_system: (COMMON.IsAdmin == 'True' || COMMON.IsSupperUser == 'True') ? true : false,
            user_id: COMMON.OrgUserId,

        }
    },
    watch: {
        month_1_name:function(){
            // alert(this.month_1_name)
        }
    },
    computed:{

    },
    methods: {
        get_child_kpis_from_kpi_list:function(kpi_id){

            var that =  this;
            var child_kpis = [];
            Object.keys(that.kpi_list).forEach(function(key){
                if(that.kpi_list[key].refer_to == kpi_id){
                    child_kpis.push(that.kpi_list[key]);
                }
            });
            // this does not work because this.kpi_list is not array
            // child_kpis=$.grep(this.kpi_list, function(kpi, index){
            //     return kpi.refer_to == that.kpi.id;
            //
            // });
            return child_kpis;

        },


        _reload_kpi:function(kpi_id, top_level=true, reset_childs=0){
            let that = this; // depend on context, usually a kpi-row component
            let parent_kpi_id = kpi_id;



            jqXhr = cloudjetRequest.ajax({
                type: 'get',
                url: `/api/v2/kpi/?kpi_id=${kpi_id}&top_level=${top_level}&parent_user_id=${COMMON.UserViewedId}`,

                success: function (kpi_data) {
                    /* Sample output
                        *
                        * response_data = {
                                'kpi': None,
                                'children': [],
                                'is_error': False,
                                'error_message': ''
                        }
                        *
                        * */

                    // QUOCDUAN NOTE: DONT REMOVE THIS
                    // THIS IS USED FOR FURTURE
                    // only re-update parent kpi data when needed
                    if (top_level){
                        let format_data = kpi_data.kpi;
                        format_data.children = kpi_data.children;
                        that.$root.$emit('kpi_reloaded', format_data);
                    }else{
                        // when call from reload_kpi injected method
                        let reloaded_kpi = kpi_data.kpi;
                        reloaded_kpi.reset_childs = reset_childs;
                        that.kpi = reloaded_kpi;
                    }


                    // let format_data = kpi_data.kpi;
                    // format_data.children = kpi_data.children;
                    // that.$root.$emit('kpi_reloaded', format_data);



                },
                error: function () {
                    alert('error when reload kpi data');
                },
                complete: function (data) {
                    // $('.add_kpi').show();
                }
            });

            return jqXhr;
            //delete old data  after reload
            //this.kpi_list[kpi_id]

        },
        // add new parent kpi or new child kpi
        add_new_kpi:function(from_kpilib=false, kpi_data){
            var that = this;


            var data = {
                'from_kpilib':from_kpilib,
                'kpi_data': JSON.stringify(kpi_data),
            };





            var jqXhr=cloudjetRequest.ajax({
                url: location.pathname,
                type: 'post',
                data: data,
                success: function (response) {
                    // any arbitrary logic here will be seperated to invidual business
                    // by call: jqXhr.done(....) for ex.


                },
                error: function () {
                }
            });
            return jqXhr;
        },


        track_component_created:function(track_obj, key){
            var that = this;

            if (! track_obj.hasOwnProperty(key)){
                track_obj[key]={
                    created: 1,

                }
            }else{
                track_obj[key].created = track_obj[key].created || 0;
                track_obj[key].created +=1;
            }
        },
        track_component_updated:function(track_obj, key){
            var that = this;

            if (! track_obj.hasOwnProperty(key)){
                track_obj[key]={
                    updated: 1,

                }
            }else{
                track_obj[key].updated = track_obj[key].updated || 0;
                track_obj[key].updated +=1;
            }

        },

        calert: function(){
            // alert('Çalışıyor');
        },
        can_edit_current_month: function (current_month, monthly_review_lock){ //check whether currrent month is allowed to edit
            return monthly_review_lock == "allow_all"?true: current_month==monthly_review_lock
        },
        get_inline_monthscores: function (monthstext, quarter, kpi) {
            // monthstext: ex: "T1|T2|T3|T4|T5|T6|T7|T8|T9|T10|T11|T12"
            var monthstext = "T1|T2|T3|T4|T5|T6|T7|T8|T9|T10|T11|T12";

            var month_1_text=this.monthDisplay(monthstext, quarter, 1);
            var month_2_text=this.monthDisplay(monthstext, quarter, 2);
            var month_3_text=this.monthDisplay(monthstext, quarter, 3);

            var month_1_score_text=this.scoreDisplay(kpi.month_1_score);
            var month_2_score_text=this.scoreDisplay(kpi.month_2_score);
            var month_3_score_text=this.scoreDisplay(kpi.month_3_score);

            return `${month_1_text}:${month_1_score_text} | ${month_2_text}:${month_2_score_text} | ${month_3_text}:${month_3_score_text}`


        },
        monthDisplay:function(monthstext, quarter, order){
            // // https://stackoverflow.com/a/33671045/6112615
            return this.$options.filters.monthDisplay(monthstext, quarter, order);
        },
        scoreDisplay:function(score){
            return this.$options.filters.scoreDisplay(score);
        },
        get_prefix_category: function(cat) {
            if (cat == "financial")
                return "F"
            else if (cat == "customer")
                return "C"
            else if(cat == "internal")
                return "P"
            else if(cat == "learninggrowth")
                return "L"
            else
                return "O"
        },
        kpi_ready: function (kpi_id, controller_prefix, ready) {
            kpi_ready(kpi_id, controller_prefix, ready);
        },

    }
});

Vue.component('decimal-input', {
    props: [
        'id',
        'value',
        'inputclass',
        'title',
        'disabled',
        'datalpignore',
        'data-qtipopts',
    ],
    // props: {
    //     'id':String,
    //     'value':Number,
    //     'inputclass':String,
    //     'title':String,
    //     'disabled':[String, Boolean],
    //     'datalpignore':[String, Boolean, Number],
    //     'data-qtipopts':String
    // }
    // ,
    // template: `
    //     <input
    //     v-bind:value="value"
    //     v-on:input="$emit('input', parseFloat($event.target.value))"
    //    v-bind:class="inputclass"
    //     v-bind:title="title"
    //     v-bind:disabled="disabled"
    //     v-bind:data-lpignore="datalpignore"
    //     >
    // `,
    template: `
        <input 
            type="text" v-model="model"
            v-bind:class="inputclass" 
            v-on:keypress="check_number"
            v-bind:disabled="disabled"
            @paste.prevent
            v-tooltip="model">
    `,
    computed: {
        model:{
            get: function(){
                var val = this.value;
                // https://stackoverflow.com/a/33671045/6112615
                return this.$options.filters.decimalDisplay(val);

            },
            set: function(val){
                var newVal=val;
                if (val === '') {
                    newVal = '';
                }
                else {
                    var number = val.split(",").join("");
                    number = Number(number);
                    // Toan note: ref https://stackoverflow.com/a/5963202/2599460
                    newVal = isNaN(number) ? 0 : parseFloat(number.toFixed(4));
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
        }
    }

});



Vue.component('evidence-button', {
    delimiters: ['{$', '$}'],
    props: [
        'month',
        'kpi_id',
        'list_evidences',
        'title',
    ],
    data:function(){
        return {
            // 'evidences':{},
            'evidences':this.list_evidences,
            'evidence_count': null,
        }
    },
    template: `  
        <button
        v-tooltip="title"
        
        v-bind:class="'btn btn-default KPI_BTN_EVD ' + (evidence_count ? ' evidence-exist btn-evidences-2': ' btn-evidences-1')"
        v-on:click="showModal_e(month, kpi_id)"
        >
        <i class="fa fa-file-text-o pull-left evidences-icon"></i> {$ evidence_count $}
        </button>
    `,
    created: function(){
        // this.evidences=this.list_evidences; // co can thiet khong khi da watch ?? <=== watch chi anh huong sau khi mounted va prop thay doi
        // this.evidences=this.list_evidences; // co can thiet khong khi da assigned o data ??? <== khong can thiet
        console.log('evidence-button created');

        // if evidence-count not loaded yet --> load evidence-count /// ????
        this.evidence_count = this.count_evidence(this.month, this.kpi_id);
        if (this.evidence_count === null){
            this.get_evidence(this.month, this.kpi_id);
        }
    },
    mounted:function(){
        console.log('evidence-button mounted');

    },
    watch:{
        list_evidences:function (value, oldValue) {
            //alert('list_evidences change' );
            console.log('evidence-button list_evidences watch');
            this.evidences=Object.assign({}, value);

        },
        evidences:function (value, oldValue) {
            // alert('evidences change' );
            //this.evidences=Object.assign({}, value);
            console.log('evidence-button evidences watch');
            this.evidence_count = this.count_evidence(this.month, this.kpi_id);
        },
        evidence_count: function(){},
    },
    computed:{

    },
    methods:{
        count_evidence: function () {
            var that = this;
            if (that.evidences[this.kpi_id] == undefined || that.evidences[this.kpi_id][this.month] == undefined)
                return null;
            else
                return that.evidences[this.kpi_id][this.month]

        },
        get_evidence: function () {
            var that = this;
            // alert('get evidence')
            cloudjetRequest.ajax({
                url: '/api/v2/kpi/' + that.kpi_id + '/evidence/upload/',
                type: 'get',
                data: {
                    type: "json",
                    month: that.month,
                    kpi_id: that.kpi_id,
                    count: true,
                },
                success: function (response) {
                    var count = response[0];

                    // var evidence={ };
                    // evidence[that.kpi_id]={};
                    // evidence[that.kpi_id][that.month]= count;
                    //
                    // that.evidences = Object.assign({}, that.evidences, evidence);

                    setObj(that.evidences, that.kpi_id+ '.'+ that.month, count);
                    that.evidences = Object.assign({}, that.evidences);
                    // that.$set(that.evidences[that.kpi_id], that.month, count);

                    // emit event for parent to update evidences list
                    that.$root.$emit('update_evidence_event_callback', that.kpi_id, that.month, count);

                },
                error: function () {

                },
            })


        },
        showModal_e:function(month, kpi_id){
            // alert('click evidence button');
            this.$root.$emit('showModal_e', month, kpi_id);
        }
    }

});



Vue.component('tag-search', {
    props: ['options', 'value'],
    template: '#select2-template',
    mounted: function () {
        var vm = this;
        this.$nextTick(function () {
            // code that assumes this.$el is in-document
            $(this.$el)
            // init select2
                .select2({
                    placeholder: "Tìm theo thẻ",
                    width: '100%',
                    multiple: true,
                    ajax: {
                        url: COMMON.LinkTagSearch,
                        quietMillis: 500,
                        cache: true,
                        dataType: 'json',
                        data: function (params) {
                            var query = {
                                q: params
                            }
                            // Query parameters will be ?search=[term]&type=public
                            return query;
                        },
                        results: function (data) {
                            employee_options = data;
                            var results = $.map(data, function (obj) {
                                obj.text = obj.name // replace name with the property used for the text
                                obj.id = obj.name
                                return obj;
                            });
                            return {
                                results: data
                            };
                        }
                    }
                })
                .val(this.value)
                .trigger('change').on('change', function () {
                vm.$emit('input', this.value)
            })
        })

    },
    watch: {
        value: function (value) {
            // update value
            $(this.$el).val(value)
        },
        options: function (options) {
            // update options
            $(this.$el).empty().select2({data: options})
        }
    },
    destroyed: function () {
        $(this.$el).off().select2('destroy')
    }
});




// Vue.directive('settooltipkpi', {
//     params: ['content'],
//     paramWatchers: {
//         content: function (val, oldVal) {
//             setToolTipKPI($(this.el),this.params.content);
//         }
//     },
//     bind:function () {
//         setToolTipKPI($(this.el),this.params.content);
//     }
// });


Vue.component('kpi-editable', {
    delimiters: ["{$", "$}"],
    props: ['kpi', 'field', 'can_edit'],
    template: $('#kpi-edit-template').html(),
    // template: '#kpi-edit-template',
    // template: `
    // <div>
    // <article @click="edit_toggle()" class="field_hover over-hide" v-if="kpi" >
    // 	\${ kpi[field] }$
    // </article>
    // <div v-if="show_edit" class="field_editing">
    // 	<textarea autofocus v-model="edit_value" class="form-control area-style id-text-edit" v-on:blur="save_change()"></textarea>
    // </div>
    //
    // </div>
    //
    // `,
    data: function () {
        return {
            show_edit: false,
            edit_value: null
        }
    },
    mounted: function () {
        this.edit_value = this.kpi[this.field];
    },
    methods: {

        edit_toggle: function () {
            if (!this.can_edit) {
                return;
            }
            this.show_edit = !this.show_edit;
            if (this.show_edit) {
                setTimeout(function () {
                    $(".id-text-edit").focus();
                }, 300);
            }
        },
        save_change: function () {
            var _this = this;
            this.show_edit = false;
            if (this.edit_value == this.kpi[this.field]) {
                return;
            }
            var data = {
                id: this.kpi.id,
            }
            data[this.field] = this.edit_value;
            cloudjetRequest.ajax({
                method: "POST",
                url: '/api/kpi/',
                data: JSON.stringify(data),
                success: function (data) {
                    _this.kpi[_this.field] = data[_this.field];
                }
            })

        }
    },
});

Vue.directive('autofocus', {
    // When the bound element is inserted into the DOM...
    inserted: function (el) {
        // Focus the element
        setTimeout(function () {
            el.focus();
        }, 100);
    },
})

// mixin for compile row when load child kpi
// https://jsfiddle.net/6w77gp23/


Vue.component('kpi-config', {
    delimiters: ['{$', '$}'],
    props: [
        'kpi',
        'organization',
        'list_kpi_group',
        'group'

    ],
    data:function(){
        return {

        }
    },
    inject: [
        'reload_kpi',
        'add_child_kpi_from_kpi_row',
        'remove_kpi_by_kpi_row',
        'is_parent_kpi',
        'update_kpi_with_score_affectability',
        // 'reload_kpi',// warning

    ],
    template: $('#kpi-config-template').html(),

    created: function(){

    },
    mounted:function(){


    },
    watch:{
    },
    computed:{
        can_add_child_kpi: function(){
            return (this.kpi.weight > 0 && this.kpi.can_add_child_kpi)
        },
        show_change_owner_tip:function(){
            return this.kpi.weight > 0 && !this.kpi.can_add_child_kpi && !this.is_parent_kpi
        },
        can_link_kpi:function(){
          return (this.is_parent_kpi && this.kpi.weight > 0) && (!this.kpi.parent && !this.kpi.refer_to && !this.kpi.cascaded_from )
        },
        can_unlink_kpi:function(){
            return (!this.kpi.parent && this.kpi.refer_to && this.kpi.cascaded_from)
        },

    },
    methods:{
        re_order:function (kpi_id) {
            var that = this;
            var data = {'command': 'reorder', 'id': kpi_id};
            cloudjetRequest.ajax({
                url: '/api/kpi/services/',
                type: 'post',
                data: data,
                success: function (response) {
                    location.reload();
                }
            });

        },
        unlink_align_up_kpi: function () {

             if (confirm(gettext('Are you sure you want to unlink this KPI') + "?")) {
                var jqxhr = this.update_kpi_with_score_affectability('unlink_align_up_kpi');
                jqxhr.done(function(){
                    sweetAlert(gettext("ACTION COMPLETED"), gettext("The KPI is successfully unlinked"), "success");
                });

            }
        },

        copy_data_to_children:function () {
            let that = this;
            swal({
                title: gettext("Copy all the data to sub-KPIs"),
                text: gettext("All the data of sub-KPI will be changed. Are you sure?"),
                type: "warning",
                showCancelButton: true,
                cancelButtonText: gettext("Cancel"),
                confirmButtonColor: "#DD6B55",
                confirmButtonText: gettext("OK"),

                // closeOnConfirm: true, // this config will be block the page
                closeOnConfirm: false, // https://stackoverflow.com/a/32981216/6112615
            }, function () {
                let jqxhr = that.update_kpi_with_score_affectability('copy_data_to_children');
                jqxhr.done(function(){
                    swal(gettext( "Success"), gettext( "Data is successfully copied"), "success");
                });
                jqxhr.error(function () {
                        swal(gettext( "Error"), gettext( "Please try again!"), "error");
                });


            });
        },
        toggle_weight_kpi:function (kpi_id) {
            this.$root.$emit('toggle_weight_kpi', kpi_id);


        },

        change_kpi_category:function(kpi_id){
            // this.$emit('change_category', kpi_id);
            this.$root.$emit('change_category', kpi_id);
        },
        get_children_kpis: function(kpi_id){
            // this.$emit('get_children_kpis', kpi_id);
            this.$root.$emit('get_children_kpis', kpi_id);
        },
        set_month_target_from_last_quarter_three_months_result:function(kpi_id){
            this.$root.$emit('set_month_target_from_last_quarter_three_months_result', kpi_id);
        },
        show_unique_code_modal: function(kpi_id){
            this.$root.$emit('show_unique_code_modal', kpi_id)
        },

        init_data_align_up_kpi:function(user, kpi_id, bsc_category){
            this.$root.$emit('init_data_align_up_kpi', user, kpi_id, bsc_category);
        },

    }

});

Vue.component('kpi-new', {
    delimiters: ['{$', '$}'],
    props: [
        // 'kpi',
        // 'organization',

    ],
    data:function(){
        return {

        }
    },
    template: $('#kpi-new-template').html(),
    created: function(){

    },
    mounted:function(){


    },
    watch:{
    },
    computed:{

    },
    methods:{

    }

});


Vue.component('btn-new-kpi', {
    delimiters: ['{$', '$}'],
    template: $('#btn-new-kpi-template').html(),

    methods:{
        show__add_kpi_methods_modal: function(){
            // alert('show modal add new kpi');
            // show modal new kpi
            this.$root.$emit('show__add_kpi_methods_modal');
        }
    }

});
Vue.component('new-kpi-by-category-modal', {
    delimiters: ['{$', '$}'],
    data:function(){
        return {
            category:'',
            options:[
                {
                    id: 'financial',
                    name: 'Tài chính',
                },
                {
                    id: 'customer',
                    name: 'Khách hàng',
                },
                {
                    id: 'internal',
                    name: 'Quy trình nội bộ',
                },
                {
                    id: 'learninggrowth',
                    name: 'Đào tạo & phát triển',
                },
                {
                    id: 'other',
                    name: 'Khác',
                },
            ]
        }
    },

    template: $('#new-kpi-by-category-modal-template').html(),
    mounted:function(){
        this.category='financial';

    },
    methods:{
        add_new_kpi_by_category: function(){
            var that=this;
            // show modal new kpi
            this.$root.$emit('add_new_kpi_by_category', that.category);
        },
        changeCategory: function(){
            // alert('changeCategory');
        },
    }

});
Vue.component('add-kpi-methods-modal', {
    delimiters: ['{$', '$}'],
    props:[
        'organization',
    ],

    template: $('#add-kpi-methods-modal-template').html(),
    mounted:function(){
        // alert('mounted in add-kpi-methods-modal');
        var that=this;
        $('#add-kpi-methods-modal').on('show.bs.modal', function (e) {
            // when the organization do not enable kpi lib, we should show modal new-kpi-by-category directly
            if (that.organization && !that.organization.enable_kpi_lib){
                that.show__new_kpi_by_category_modal();
                return false; // cancel show event
                // $('#add-kpi-methods-modal').modal('hide');
            }
        })
    },
    methods:{
        show__new_kpi_by_category_modal: function(){
            var that=this;
            // show modal new kpi
            this.$root.$emit('show__new_kpi_by_category_modal');
        },

        show__new_kpi_by_kpilib_modal: function(){
            this.$root.$emit('show__new_kpi_by_kpilib_modal');
        },
    }
});

// Vue.use(Autocomplete);


Vue.component('kpi-owner', {
    delimiters: ['{$', '$}'],
    props: [
        'kpi',
        'is_parent_kpi',

    ],
    data:function(){
        return {
            show_search_box:false,
        }
    },
    inject:[
        'reload_kpi',
    ],
    template: $('#kpi-owner-template').html(),
    created: function(){

    },
    mounted:function(){


    },
    watch:{
    },
    computed:{
        search_url: function () {
            return '/api/v2/searchable_peoplelist/?&limit=10&from_kpi_id=' + this.kpi.id + '&search_term='

        },
        is_able_to_change_owner: function () {
            return !this.is_parent_kpi && this.kpi.weight > 0
        }

    },
    methods:{
        formatData(results){
            // this resultsFormatter will be check before resultsProperty and default response `results`
            // https://github.com/charliekassel/vuejs-autocomplete/blob/6feca77fcfce372d27b5380670fe22aaa2a2bada/src/components/Autocomplete.vue
            if (results.data){
                return results.data.suggestions || [];
            }
            else{
                return [];
            }

        },

        formattedDisplay (result) {
            // alert('formattedDisplay');
            // return result.name + ' [' + result.groupId + ']'
            let html='';
            html = `
                <div class="incharge-user-item">
                    <img align="left" src="${result.avatar}" alt="Avatar" class="user-thumb">
                    <div class="incharge-user-info">
                        <div class="incharge-user-name">
                            <span class="relative-level">L[${result.relative_level}]</span> <span>${result.display_name}</span>
                         </div>
                        
                        <div class="incharge-user-email">${result.email}</div>    
                    </div>
                </div>
                
                
            `;
            return html;
            // return result.value
        },
        onSelectInchargeUser (selected_item) {

            var that = this;
            // alert('USER SELECTED');
            // hide search box when an user selected
            this.show_search_box=false;

            var to_user=selected_item.selectedObject;
            var to_user_id=to_user.id;


            // access the autocomplete component methods from the parent
            // this.$refs.kpi_owner_autocomplete.clear();
            let autocomplete_instance = this.$refs.kpi_owner_autocomplete;
            // this code let us show user email in autocomplete-input instead of result of `formattedDisplay` function
            autocomplete_instance.$nextTick(function(){
                this.display = to_user.email;
            });


            // do not update new tobe assigned user if kpi.user not change
            if (to_user_id == this.kpi.user){
                return false;
            }

            var data={
                user: to_user_id
            };

            var jqXhr=cloudjetRequest.ajax({
                url: `/api/v2/kpi/${this.kpi.id}/assign-to/`,
                type: 'put',
                data: data,
                success: function (kpi_data) {
                    /*
                    * Sample data:
                    *  {
                        suggestions: [
                            {
                            relative_level: 1,
                            user_id: 50,
                            value: "[L1] Trần Mạnh Hà - hatm@demo.cjs.vn",
                            id: 50,
                            avatar: "/static/img/people/person.png",
                            position: "Phó Trưởng ban",
                            display_name: "Trần Mạnh Hà",
                            email: "hatm@demo.cjs.vn"
                            },
                            {
                            relative_level: 1,
                            user_id: 54,
                            value: "[L1] Mai Huy Vũ - vumh@demo.cjs.vn",
                            id: 54,
                            avatar: "/static/img/people/person.png",
                            position: "Chuyên viên",
                            display_name: "Mai Huy Vũ",
                            email: "vumh@demo.cjs.vn"
                            },
                        ]
                    * */
                    that.reload_kpi();
                },
                error: function (err) {
                    if (err.responseJSON) {
                        msg = err.responseJSON.message || err.responseJSON.owner_email;
                        if (msg) {
                            alert(msg);
                        }
                	}
                    that.reload_kpi();
                },
            });

        },

        dismiss_popover: function(){
            this.show_search_box = false;
        },
        update_assigned_user_data: function(selected_item){
            var to_user=selected_item.selectedObject;
            this.$set(this.kpi, 'user', to_user.id);
            this.$set(this.kpi, 'incharge_user_email', to_user.email);
        },


    }

});



Vue.component('kpi-progressbar', {
    delimiters: ['{$', '$}'],
    props: [
        'kpi',
        'organization',
        'current_quarter',
        'month_1_name',
        'month_2_name',
        'month_3_name',
        'evidences',
        'is_parent_kpi',
        'list_kpi_group',
        'group',
        // 'is_user_system',

    ],
    data:function(){
        return {

        }
    },
    inject:[
        'update_kpi_with_score_affectability',
    ],
    template: $('#kpi-progressbar-template').html(),
    created: function(){

    },
    mounted:function(){


    },
    watch:{

    },
    computed:{
        show_progress_bar_score: function(){
            return this.kpi.weight > 0
        },
    },
    methods:{

        copy_quarter_targets_into_month_targets: function () {
            let that = this;
            swal({
                title: gettext("Quarter target will be copied to the target of each month"),
                text: gettext("Are you sure?"),
                type: "warning",
                showCancelButton: true,
                cancelButtonText: gettext("Cancel"),
                confirmButtonColor: "#DD6B55",
                confirmButtonText: gettext("OK"),
                closeOnConfirm: true
            }, function () {

                let update_data=[];
                that.update_kpi_with_score_affectability('copy_quarter_targets_into_month_targets', update_data);

            })
        },

        triggerAdjustPerformanceThreshold(kpi_id){
            this.$root.$emit('adjust_performance_level',kpi_id)
        },


        percent_progressbar: function(kpi){
            return kpi.latest_score*100/this.organization.max_score;
        },
        disable_edit_target: function(kpi){
            if (this.is_user_system) return false;
            console.log("target:", kpi.id);
            return !(kpi.enable_edit && this.organization.allow_edit_monthly_target && this.organization.enable_to_edit);

        },
        get_title_tooltip: function (kpi_month_value, disable, month_number, kpi_type) {
            that = this;
            var message;
            var month_name = month_number == 1 ? that.month_1_name : month_number == 2 ? that.month_2_name : month_number == 3 ? that.month_3_name : '';
            switch (kpi_type) {
                case 1:
                    switch (month_number) {
                        case 1:
                            if ((!kpi_month_value.enable_review || !disable.enable_month_1_review))
                                if ((kpi_month_value.month_2 != null || kpi_month_value.month_3 != null) && kpi_month_value.month_1 == null) {
                                    message = gettext("You forget review the result") + ' ' + month_name;
                                } else if ((kpi_month_value.month_2 == null || kpi_month_value.month_3 == null) && kpi_month_value.month_1 == null) {
                                    message = gettext("You can not to review the result earlier than the specified time") + ' ' + month_name;
                                    if (!(!kpi_month_value.enable_review || !disable.enable_month_2_review) || !(!kpi_month_value.enable_review || !disable.enable_month_3_review)) {
                                        message = gettext("You forget review the result") + ' ' + month_name;
                                    }
                                } else if ((kpi_month_value.month_2 != null || kpi_month_value.month_3 != null) && kpi_month_value.month_1 != null) {
                                    message = gettext("Over time to review the KPI result") + ' ' + month_name;
                                }
                            break;
                        case 2:
                            if ((!kpi_month_value.enable_review || !disable.enable_month_2_review))
                                if ((kpi_month_value.month_1 != null || kpi_month_value.month_3 != null) && kpi_month_value.month_2 == null) {
                                    message = gettext("You forget review the result") + ' ' + month_name;
                                } else if ((kpi_month_value.month_1 == null || kpi_month_value.month_3 == null) && kpi_month_value.month_2 == null) {
                                    message = gettext("You can not to review the result earlier than the specified time") + ' ' + month_name;
                                    if (!(!kpi_month_value.enable_review || !disable.enable_month_3_review)) {
                                        message = gettext("You forget review the result") + ' ' + month_name;
                                    }
                                } else if ((kpi_month_value.month_1 != null || kpi_month_value.month_3 != null) && kpi_month_value.month_2 != null) {
                                    message = gettext("Over time to review the KPI result") + ' ' + month_name;
                                }
                            break;
                        case 3 :
                            if ((!kpi_month_value.enable_review || !disable.enable_month_3_review))
                                if ((kpi_month_value.month_2 != null || kpi_month_value.month_1 != null) && kpi_month_value.month_3 == null) {
                                    message = gettext("You forget review the result") + ' ' + month_name;
                                } else if ((kpi_month_value.month_2 == null || kpi_month_value.month_1 == null) && kpi_month_value.month_3 == null) {
                                    message = gettext("You can not to review the result earlier than the specified time") + ' ' + month_name;
                                } else if ((kpi_month_value.month_2 != null || kpi_month_value.month_1 != null) && kpi_month_value.month_3 != null) {
                                    message = gettext("Over time to review the KPI result") + ' ' + month_name;
                                }
                            break;
                        default:
                            message = null;
                            break;
                    }
                    break;
                case 2:
                    if (disable)
                        return gettext("You can not change the KPI Goal") + ' ' + month_name + ' ' + gettext("switch to the Latest month caculation method to change");
                    break;
                case 3:
                    if (disable)
                        return gettext("This is KPI Achievements") + ' ' + month_name + ' ' + gettext("you can only view and can not edit");
                    break;
                default:
                    break;
            }
            return message;
        },
        disable_review_kpi: function(parent_id, current_month){
            if (this.is_user_system) return false;
            var is_manager = COMMON.UserId != COMMON.UserViewedId;
            var current_month_locked = !(this.can_edit_current_month(current_month, this.organization.monthly_review_lock));
            if (is_manager){ // if current Login user is parent of user viewed
                return ( !this.organization.allow_manager_review || current_month_locked ) // manager can edit if enable_to_edit not pass
            }
            else {
                return ( !this.organization.allow_employee_review || current_month_locked ) // employee can edit(review) kpi only if not pass self_review_date
            }
        },

        check_quarter_plan: function (kpi) {
            var that = this;
            var quarter_obj = {
                1:"one",
                2:"two",
                3:"three",
                4:"four"
            };
            var quarter_plan = kpi['quarter_' + quarter_obj[that.current_quarter.quarter] + '_target'];
            if (kpi.score_calculation_type == 'sum' || that.kpi.score_calculation_type == 'average' || kpi.score_calculation_type == 'most_recent'){
                if ( kpi.target != quarter_plan) {
                    return true;
                }
                return false;
            }
        },



    }

});

Vue.component('kpi-group', {
    delimiters: ['{$', '$}'],
    props: [
        'group',
        // 'kpi_list',
        'parent_kpis',
        'current_quarter',
        "organization",
        "current_quarter",
        // "group",
        "employee_performance",
        "company_params",
        "evidences",
        "month_1_name",
        "month_2_name",
        "month_3_name",
        "user_smap",
        "list_kpi_group",
        'is_parent_kpi',
    ],
    data:function(){
        return {
            is_expand_kpis:false,
            reset_child_kpi: 0, // tell kpi reset childs
            // show_group_kpis:false,
            // show_group_heading:false,
        }
    },

    template: $('#group-kpi-template').html(),
    created: function(){
        let that = this;
        this.track_component_created(COMMON.groups, `${this.group.category}_${this.group.id}`);


        this.$on('child_kpi_removed', function(kpi_id){
            /*
            * if kpi_id !== undefined: mean remove parent_kpi
            *
            * remove kpi from kpi list
            * */
            if(kpi_id){
                that.$root.$emit('parent_kpi_removed', kpi_id) ;
            }

        })
        this.$on('child_kpi_added',function(){
            that.$root.get_current_employee_performance();
        });

        this.$on('child_kpi_score_updated',function(){
            that.$root.get_current_employee_performance();
        });




    },
    updated: function(){
        this.track_component_updated(COMMON.groups, this.group.slug);
    },

    mounted:function(){


    },
    watch:{
    },
    computed:{
        // depricated
        // show_group_heading: function(){
        //     var show = this.group.name ? true : false;
        //     return show
        // },
        show_group_kpis: function(){
            var show = false;

            if(this.is_expand_kpis == true){ //show_group_heading == true
                show = true;

            }else{
                show = false;
            }

            return show;


        },

        btn_toggle_class:function(){
            var cls='fa fa-2x';
            if (this.show_group_kpis == true){
                cls += ' fa-caret-down';
            }else{
                cls += ' fa-caret-right';
            }
            return cls;
        },
        group_parent_kpis: function(){
            let that = this;
            let kpis=[];
            Object.values(this.parent_kpis).forEach(function(kpi){
                if(that.is_kpi_belong_to_group(kpi)){
                    kpis.push(kpi);
                }
            });
            return kpis;
        }
    },
    methods:{
        is_kpi_belong_to_group:function(kpi){
            //case kpi-group khong ton tai tren he thong
            if(!this.group.id || (this.group.id && this.group.id < 0 ) ){
                // truong hop nay, neu user khong co group thi cho vao group ảo này (chỉ dùng để hiển thị trên giao diện)
                if (!kpi.group_kpi){
                    return true
                }else{
                    return false
                }
            }else{
                return kpi.group_kpi == this.group.id
            }


        },
        toggleKPIs:function() {

            this.is_expand_kpis = ! this.is_expand_kpis;


        },

    }

});

Vue.component('kpi-row', {
    delimiters: ['{$', '$}'],
    props: [
        'external_kpi',
        // 'kpi',
        // 'kpi_list',
        'organization',
        'current_quarter',
        'month_1_name',
        'month_2_name',
        'month_3_name',
        'group',
        'employee_performance',
        'company_params',
        'evidences',
        'is_parent_kpi',
        'reset_child_kpis',
        'list_kpi_group'
        // 'is_user_system',

    ],
    data:function(){
        return {
            is_child_kpis_loaded:false,
            // internal_kpi_list: this.kpi_list,
            show_childs:false,
            temp_value: {},
            is_childs_show:false,
            kpi: this.external_kpi,
            child_kpis: this.external_kpi.children || [],
            // childs__reset_child_kpi: this.reset_child_kpis,
        }
    },
    template: $('#kpi-row-template').html(),
    provide: function () {
        return {
            reload_kpi: this.reload_kpi,
            add_child_kpi_from_kpi_row: this.add_child_kpi,
            remove_kpi_by_kpi_row: this.remove_kpi,
            is_parent_kpi: this.is_parent_kpi,
            update_kpi_with_score_affectability: this.update_kpi_with_score_affectability
        }
    },
    created: function(){
        var that = this;
        this.track_component_created(COMMON.kpis, this.kpi.id);


        // run only once
        if (this.child_kpis.length > 0){
            this.is_child_kpis_loaded = true;
        }

        this.$on('child_kpi_added', function(){
            that.on_child_kpi_added();
        });
        this.$on('child_kpi_removed', function(kpi_id){
            that.on_child_kpi_removed(kpi_id);

        });
        this.$on('child_kpi_score_updated', function(){
            // reload kpi and continue to propagate the event to parent
            that.on_child_kpi_score_updated();

        });
        this.$on('child_kpi_reviewed', function(){

        });


    },
    updated: function(){
        this.track_component_updated(COMMON.kpis, this.kpi.id);

    },
    mounted:function(){


    },
    watch:{

        external_kpi: {
            handler: function(val, oldVal){
                // this.kpi = this.external_kpi;
                // console.log('external_kpi');
                this.kpi = this.external_kpi;
            }
        },
        // reset_child_kpis: {
        //    handler: function(val, oldVal){
        //        alert('reset_child_kpis: '+ val);
        //        // reset child kpis to empty array
        //        if (val === 1){
        //            this.
        // ;
        //            this.childs__reset_child_kpi = 1; // // notify childs to reset child's child-kpis list, but not load
        //        }
        //        // // reset child kpis to empty array
        //        // // and force reload kpi
        //        // else if (val === 2){
        //        //     this.reset_childs();
        //        //     this.childs__reset_child_kpi = 1; // notify childs to reset child's child-kpis list, but not load
        //        //     this.get_children_kpis(true);
        //        //
        //        // }
        //    }
        // },

    },
    computed:{
        show_kpi_link_symbol: function(){
            return this.kpi.refer_to !== null && this.is_parent_kpi
        },
        // child_kpis: function(){
        //
        //     // var child_kpis = this.get_child_kpis_from_kpi_list(this.kpi.id);
        //     // alert('child_kpis inside kpi-row component changed: '+ child_kpis.length);
        //     // alert('child_kpis computed');
        //     return this.kpi.children;
        // },
        btn_kpi_toggle_class:function(){
            if (this.show_childs==true)
                return 'fa fa-angle-double-down';
            else return 'fa fa-angle-double-right';
        },

    },
    methods:{


        update_quarter_x_target: function(update_data){
            let data = this.kpi;
             let url = `/api/v2/kpi/${kpi_id}/update-quarter-target/` ;
            data.quarter_one_target = update_data[0].value;
            data.quarter_two_target = update_data[1].value;
            data.quarter_three_target = update_data[2].value;
            data.quarter_four_target = update_data[3].value;

            let jqxhr = cloudjetRequest.ajax({
                url: url,
                type: 'POST',
                data: JSON.stringify(data),
                contentType: "application/json",
                success: function(updated_kpi_data){},
                error: function(jqxhr){
                    alert('error on update kpi');
                },
            });

            // UI
            jqxhr.done(function(){
                // $(".save-btn-calculation").hide();
                success_requestcenter(gettext("Update successful!"));
            });

            // logic
            jqxhr.done(function(updated_kpi_data){
                that.reload_kpi();
            });

            return jqxhr;

        },

        update_kpi_with_score_affectability: function(update_type, update_data){
            /*
            *
            * 1. update types:
            *   + quarter_x_target
            *   + month_x_target
            *   + month_x_result: month x result
            *   + score_calculation_type: { latest month, sum, average }
            *   + operator: { > , <, = }
            *   + copy quarter target to month targets
            *   + re-calculate kpi score
            *   + copy data to childs
            *   + unlink child kpi
            *   + link up kpi: <--- not implement here
            * 2. work flow:
            *   +
            * */
            let that = this;
            let url='';
            let kpi_id = this.kpi.id;
            let data=this.kpi;


            switch (update_type) {
                case 'unlink_align_up_kpi':
                    url = '/performance/kpi/align-up/';
                    data = {
                        // user_id: user_id,
                        aligned_kpi_id: kpi_id
                    }
                    break;
                case 're_calculate_kpi_score':
                    url = '/api/kpi/services/';
                    data = {'command': 'recalculate', 'id': kpi_id};
                    break;
                case 'copy_data_to_children':
                    url = '/api/kpi/services/';
                    data = {'command': 'copy_data_to_children', 'id': kpi_id};
                    break;

                /**********************************************
                * the following cases will affect kpi's score
                 * so, we need to reload parent kpis also to get updated parent-kpi's score
                *********************************************/


                case 'month_x_target':
                    url = COMMON.LinkKPISevices ;
                    data.command = 'update_month_target';
                    data.month_1_target = update_data[0].value;
                    data.month_2_target = update_data[1].value;
                    data.month_3_target = update_data[2].value;
                    break;
                 case 'copy_quarter_targets_into_month_targets':
                    url = COMMON.LinkKPISevices ;
                    kpi.command = 'update_month_target';
                    // TODO: net re-check logic here
                     /*
                     * kpi.month_1_target = that.kpi.target;
                     * or
                     * kpi.month_1_target = that.kpi.quarter_x_target;?????????
                     *
                     * */
                    data.month_1_target = that.kpi.target;
                    data.month_2_target = that.kpi.target;
                    data.month_3_target = that.kpi.target;

                case 'month_x_result':
                    url = '/performance/kpi/update-score/' ;
                    data.month_1 = update_data[0].value;
                    data.month_2 = update_data[1].value;
                    data.month_3 = update_data[2].value;
                    break;
                case 'score_calculation_type':
                    url = `/api/v2/kpi/${kpi_id}/update-score-calculation-type/` ;
                    break;
                case 'operator':
                     url = '/performance/kpi/update-score/' ;
                    break;


                /* NOTE: there are several cases that also affect kpi's score
                    Includes:
                         + change kpi weight/delay kpi
                         + change parent_auto_score
                         + change method of: threshold or ratio

                  */
            }

            /* QUOCDUAN note:
            *       do not need check permission here
            *       because of we had already disabled user update data on inputs if user have no permission to.
            *
            * */
            // if(update_type == 'month_target' && !kpi.enable_edit && !that.organization.allow_edit_monthly_target){
            //     guide_requestcenter(gettext("You don't have permission to edit month target"));
            //     return;
            // }else if(update_type == 'month_real' && !kpi.enable_review) {
            //     guide_requestcenter(gettext("Not allowed to modify KPI, please check if any wrong data in KPI"));
            //     return;
            // }

            let jqxhr = cloudjetRequest.ajax({
                url: url,
                type: 'POST',
                data: JSON.stringify(data),
                contentType: "application/json",
                success: function(updated_kpi_data){},
                error: function(jqxhr){
                    alert('error on update kpi');
                },
            });

            // UI
            jqxhr.done(function(){
                // $(".save-btn-calculation").hide();
                success_requestcenter(gettext("Update successful!"));
            });

            // logic
            jqxhr.done(function(updated_kpi_data){
                that.$emit('child_kpi_score_updated', updated_kpi_data);
            });

            return jqxhr;
        },
        on_child_kpi_score_updated: function(){
            let that = this;
            //1. reload kpi data (score, ...)
            // we reload kpi data from server instead of using responsed data (to eliminate bug of wrong data structure)
            that.reload_kpi();
            // 2. notify parent kpi (or kpi group) to reload kpi's score (or employee's score)
            that.$parent.$emit('child_kpi_score_updated');
        },

        is_root_kpi: function (kpi) {

            that = this;
            if (kpi.parent == 0 || kpi.parent == undefined || kpi.parent == null) {
                return true;
            }
            else {
                return true;
            }
        },

        check_disable_edit: function (kpi) {
            // Document permission edit quarter target & kpi target
            // https://cloudjet.atlassian.net/wiki/spaces/PM/pages/454328403
            var that = this;
            // Admin allow edit
            if (this.is_user_system){
                return true;
            }

            // Disable when the organization didn't allow to edit month target
            if (!this.organization.allow_edit_monthly_target){
                return false;
            }

            // Enable when the kpi allows to edit
            if (kpi.enable_edit) {
                return true;
            }

            // Otherwise disabled
            return false
        },

        show_child_kpis:function(){
            this.show_childs = true;
        },
        hide_child_kpis:function(){
            this.show_childs = false;
        },
        toggle_childs: function(){
            var that=this;
            var jqXhr=this.get_children_kpis();
            if (jqXhr === null){
                that.show_childs = ! that.show_childs;
            }else{
                jqXhr.done(function(){
                    that.show_childs = ! that.show_childs;
                });
            }
        },

        get_children_kpis:function(force_load=false){
            var that = this;
            var jqXhr=null;
            // alert('get_children_kpis');

            // this.show_childs = !this.show_childs;
            if (this.is_child_kpis_loaded==true && !force_load){
                // return this.child_kpis;
            }
            else{
                // get child kpis from server

                jqXhr = cloudjetRequest.ajax({
                    type: 'get',
                    // url: '/api/v2/kpi/?parent_id=' + that.kpi.id,
                    url: `/api/v2/kpi/?kpi_id=${that.kpi.id}&include_childs=1` ,

                    success: function (kpi_data) {
                        /* Sample output
                        *
                        * response_data = {
                                'kpi': None,
                                'children': [],
                                'is_error': False,
                                'error_message': ''
                        }
                        *
                        * */

                        var list_child_kpis=kpi_data.children;


                        // TODO: check lai
                        // ********* KHONG CAN THIET ???? ********
                        // that.$root.$emit('update_list_child_kpis', that.kpi.id, list_child_kpis);

                        // TODO: NEED CHECK reload kpi function
                        that.is_child_kpis_loaded = true;
                        that.child_kpis = list_child_kpis;
                        // that.$nextTick(function(){
                        //     that.child_kpis = list_child_kpis;
                        // });



                    },
                    error: function () {
                        alert('error');
                    },
                    complete: function (data) {
                        // $('.add_kpi').show();
                    }
                });

            }

            return jqXhr;


        },

        change_group: function(kpi){
            this.$root.$emit('change_group', kpi);
        },
        update_kpi: function (kpi, show_blocking_modal, callback) {
            this.$root.$emit('update_kpi', kpi, show_blocking_modal, callback);

        },

        add_child_kpi: function(){
            /*
            * add child kpi for the current kpi (this kpi component instance)
            * then:
            * 1. update list of child kpis
            * 2. emit event to parent kpi row to reload parent kpi data (score, parent_auto_score, children_data, has_child, ...)
            *
            * */
            let that = this;
            let parent_kpi_id=this.kpi.id;
            let kpi_data={
                parent_kpi_id:parent_kpi_id
            };
            let jqXhr = this.add_new_kpi(false, kpi_data);



            // 1. update list of child kpis
            jqXhr.done(function(response){
                let new_kpi_data = response.data;
                if (that.is_child_kpis_loaded == false){
                    // load child kpis
                    // after then show list of childs
                    let force_load = true;
                    let jqxhr1 = that.get_children_kpis(force_load);// force_load mod always return a promise
                    jqxhr1.done(function(){
                        that.show_child_kpis();
                    });


                }else{
                    // add new child kpi to list of child kpis
                    // and show list of childs
                    that.child_kpis.push(new_kpi_data);
                    that.show_child_kpis();
                }


            });

            // 2. emit event to parent kpi row to reload parent kpi data (score, parent_auto_score, children_data, has_child, ...)
            jqXhr.done(function(response){
                that.$emit('child_kpi_added');
            });

        },
         remove_child_kpi: function(kpi_id){
            /*
            * remove child kpi from list of child kpis
            * */
            let that = this;
            // only remove when child_kpis is loaded
            if (this.is_child_kpis_loaded == true && this.child_kpis.length > 0) {

                // Note: The findIndex() method is not supported in IE 11 (and earlier versions).
                // The findIndex() method returns the index of the first element in an array that pass a test (provided as a function).
                let found_index = this.child_kpis.findIndex(function(current_kpi, index, arr){
                    return current_kpi.id == kpi_id
                });
                if (found_index != -1){
                    this.child_kpis.pop(found_index);
                }
            }

        },
        on_child_kpi_added: function(){
            /*
            * reload this kpi data
            * then propagrate the event to parent kpi
            * */
            let that = this;
            this.reload_kpi();
            this.$parent.$emit('child_kpi_added');
        },
        reload_kpi: function(top_level=false, reload_childs=false){
            this._reload_kpi(this.kpi.id, top_level);
            if(reload_childs == true){
                this.reset_childs();
               // this.childs__reset_child_kpi = 1; // // notify childs to reset child's child-kpis list, but not load


                this.get_children_kpis(true);
            }
        },
        remove_kpi:function(){
            /*
            * post up to server to remove the current kpi
            * then:
            * 1. emit event to parent
            * */
            let that = this;
            let kpi_id = that.kpi.id;
            let key = that.kpi.unique_key;
            swal({
                title:  gettext("KPI deleted can not be restored"),
                text: gettext("Are you sure?"),
                type: "warning",
                showCancelButton: true,
                cancelButtonText: gettext( "Cancel"),
                confirmButtonColor: "#DD6B55",
                confirmButtonText: gettext("OK"),
                closeOnConfirm: false
            }, function () {
                var data = {
                    kpi_id: kpi_id,
                    unique_key: key
                };
                let jqxhr = cloudjetRequest.ajax({
                    url: COMMON.LinkDeleteKpi,
                    type: 'post',
                    data: data,
                    success: function (data, statusText, jqXHR) {

                        if (jqXHR.status === 200) {

                            swal(gettext("Success"), gettext("KPI is successfully deleted"), "success");
                            // emit event to parent
                            that.$parent.$emit('child_kpi_removed', kpi_id);
                            // that.$root.$emit('kpi_removed', kpi_id);


                        } else {
                            swal(gettext("Unsuccess"), jqXHR.responseJSON.message, "error");
                        }
                    },
                    error: function (jqXHR, settings, errorThrown) {
                        swal(gettext("Unsuccess"), jqXHR.responseJSON.message, "error");
                    }
                });



            });


        },

        on_child_kpi_removed: function(kpi_id){
            /*
            * 1. update list of child kpis (remove the child kpi in list)
            * 2. reload kpi to get updated data (score, parent_auto_score, children_data, has_child, ...)
            * 2. propagrate the event to parent kpi
            * */
            let that = this;

            if (kpi_id){
                this.remove_child_kpi(kpi_id);
            }

            this.reload_kpi();
            this.$parent.$emit('child_kpi_removed');
        },
        reset_childs: function(){
            /*
            * reset list of child kpis to empty array
            * and mark the kpi is not loaded childs
            * */
            this.child_kpis = [];
            this.is_child_kpis_loaded = false;
        },



    }

});


var v = new Vue({
    delimiters: ['${', '}$'],
    // el: '#container',
    el: '#content',
    data: {
        evidences: {},
        current_evidence: null,
        filename: '',
        action_plan_filename:'',
        month: '',
        month_name: '',
        list_evidence: [],
        list_action_plan_file:[],
        user_action_plan_permission: false,
        evidence_id: '',
        content: '',
        kpi_list: {},

        list_kpi_group: {
            customer: {
                ungroup_kpis: [

                ],
                group_kpis: [
                    // {
                    //     category: "customer",
                    //     map: 217,
                    //     group: true,
                    //     name: "CẢI THIỆN HÌNH ẢNH THƯƠNG HIỆU EVNGENCO 3 TRÁCH NHIỆM & MINH BẠCH",
                    //     kpis: [],
                    //     id: 629
                    // },
                    // {
                    //     category: "customer",
                    //     map: 217,
                    //     group: true,
                    //     name: "NÂNG CAO HÀI LÒNG CỦA EVN, BỘ, NGÀNH",
                    //     kpis: [],
                    //     id: 630
                    // }
                ]
            },
            internal: {
                ungroup_kpis: [

                ],
                group_kpis: [

                ]
            },
            financial: {
                ungroup_kpis: [

                ],
                group_kpis: [

                ]
            },
            learninggrowth: {
                ungroup_kpis: [

                ],
                group_kpis: [

                ]
            },
            // TODO: NEED CHECK OTHER GROUPS KPI
            other: {
                ungroup_kpis: [

                ],
                group_kpis: [

                ]
            },
        },


        // list_group: {},
        // total_weight: {},
        total_weight_by_user: {},
        toggle_states: {},
        total_weight_bygroup: {'A': 0, 'B': 0, 'C': 0, 'O': 0, 'G': 0},
        total_kpis_bygroup: {'A': 0, 'B': 0, 'C': 0, 'O': 0, 'G': 0},
        // total_old_weight: {},
        total_old_weight_by_user: {},
        total_old_weight_bygroup: {'A': 0, 'B': 0, 'C': 0, 'O': 0, 'G': 0},
        total_old_kpis_bygroup: {'A': 0, 'B': 0, 'C': 0, 'O': 0, 'G': 0},
        active_kpi_id: '',
        is_child: true,
        status_error: false,
        message_error: '',
        new_group_total: {'A': 0, 'B': 0, 'C': 0, 'O': 0, 'G': 0},
        month_1_name: "M1",
        month_2_name: "M2",
        month_3_name: "M3",
        current_quarter: {},
        quarter_by_id: {},
        current_kpi: {},
        employee_performance: {
            email: "",
            kpi_percent: 0,
            kpi_percent_recent: 0,
            kpi_score: 0,
            kpi_score_recent: 0,
            month_1_score: 0,
            month_2_score: 0,
            month_3_score: 0,
            profile: {
                display_name: "",
                get_avatar: "/static/img/people/person.png",
                get_kpi_url: "#",
                get_subordinate_kpi_url: "#",
                title: "",
            },
            team_avg_kpi_percent: 0,
            user_id: 0,
            version: "",
        },
        total_zero_score_kpis: [],
        complete_review: '',
        search: false,
        A_CHANGE: false,
        B_CHANGE: false,
        C_CHANGE: false,
        O_CHANGE: false,
        G_CHANGE: false,
        current_user_id: COMMON.UserId,
        categories: {
            selected: '',
            category: ['financial', 'customer', 'internal', 'learninggrowth', 'other']
        },
        backup_month: [],
        // moved to mixin
        // user_id: COMMON.OrgUserId,
        current_user_profile: {},
        exscore_user_data: {},
        exscore_lib_data: {},
        exscore_score: {
            '1': {
                month_name: '',
                score: 0,
                signal: 'safe'
            },
            '2': {
                month_name: '',
                score: 0,
                signal: 'safe'
            },
            '3': {
                month_name: '',
                score: 0,
                signal: 'safe'
            },
            'current': '---'
        },
        has_perm: {'MANGER_REVIEW': false},
        company_params: {
            ceo_id: null,
            quarter_id: null,
            performance: {
                email:"",
                kpi_percent:0,
                kpi_percent_recent:0,
                kpi_score:0,
                kpi_score_recent:0,
                month_1_score:0,
                month_2_score:0,
                month_3_score:0,
                profile:{
                    display_name:"",
                    get_avatar:"/static/img/people/person.png",
                    get_kpi_url:"#",
                    get_subordinate_kpi_url:"#",
                    title:"",
                },
                team_avg_kpi_percent:0,
                user_id:0,
                version:"",
            }
        },
        quarter_list: [],
        backups_list: [],
        chosen_backup_month: null,
        backup_kpis: [],
        backup_month_name: '',
        current_backup: null,
        reason_kpi: '',
        check_submit_reason: true,
        confirm_delay_kpi: false,
        elm_kpi: null,
        manager_kpis: [],
        selected_manager_kpi: null,
        selected_kpi: null,
        translate: {
            'financial': gettext('Financial'),
            'customer': gettext('Customer'),
            'internal': gettext('Internal Process'),
            'learninggrowth': gettext('Learn & Growth'),
            'other': gettext('Others')
        },
        temp_value: {},
        cache_weight: '',
        adjusting_kpi: {},
        adjusting_chart: null,
        estimated_result_with_threshold: '',
        query: '',
        email_confirm: '',
        status_confirm: false,
        list_user_searched: [],
        list_surbodinates: [],
        list_surbodinates_user_viewed: [],
        storage_user: [],
        preview_attach_url: '',
        is_img: true,
        current_children_data: {},
        tag_list: {},
        tag_input: "",
        // is_user_system: false,
        timeout: null,
        tags: [],
        // searched_kpis: [],
        // next_url_kpi_lib: '',
        // DEPARTMENTS: COMMON.Departments,
        FUNCTIONS: [],
        extra_tags: [],
        // selected_tags: "",
        selected_kpilib: {},
        // BSC_CATEGORY: COMMON.BSCCategory,
        // EXTRA_FIELDS: COMMON.ExtraFields,
        unique_code_cache: '',
        total_edit_weight: {},
        kpi_list_cache: [],
        option_export: 'q-m',
        message_error_upload_evidence: '',
        status_upload_action_plan: true,
        action_plan_to_be_deleted: null,
        preview_attach_modal_type:'',
        same_user: false,
        disable_upload: false,
        //datatemp for kpilib
        visible: false,
        // end data temp for kpi lib
        organization:[],
        fetched_data_exscore_user:[],
        parent_score_auto:true,
        user_smap: {},
        selected_group_kpi: {}
    },
    validators: {
        numeric: { // `numeric` custom validator local registration
            message: 'Invalid numeric value',
            check: function (val) {
                return /^[-+]?[0-9]+$/.test(val)
            }
        },
    },

    computed: {
        parentKPIs: function (){
            var kpis = getKPIParentOfViewedUser(this.kpi_list);
            return kpis;
        },
        group_bsc_category_kpis: function () {
            return _.groupBy(this.parentKPIs, 'bsc_category')
        },
        total_weight_exclude_delayed: function () {
            var total = 0;
            var that = this;

            Object.values(this.parentKPIs).forEach(function (kpi) {
                if (kpi.id != that.active_kpi_id) {
                    total += parseFloat(kpi.weight) || 0;
                }
            });
            return total;
        },
        total_old_weight_kpi_parent: function () {
            var total = 0;
            var that = this;
            Object.values(this.parentKPIs).forEach(function (kpi) {
                total += parseFloat(kpi.old_weight) || 0;
            });
            return total;
        },
        total_weight_edit_kpi_parent: function () {
            var total = 0;
            Object.values(this.parentKPIs).forEach(function (kpi){
                total += parseFloat(kpi.new_weight) || 0;
            })
            return total;
        },
        adjust_min_performance: function () {
            var self = this;
            return ((self.adjusting_kpi.achievement_calculation_method_extra.bottom.target / self.adjusting_kpi['month_' + self.adjusting_kpi.adjusting_month + '_target']) * 100).toFixed(2);
        },
        filtered_kpi_level: function(){
            var  self =  this;
            var id = self.active_kpi_id;
            if (id != '' && id != undefined && parseInt(id) > 0) {
                var parent_id = self.kpi_list[id].refer_to;
                return filter_kpi(self.kpi_list, parent_id);
            }
            return self.kpi_list;
        },
    },
    mounted: function () {

        this.get_current_quarter();
        this.get_quarter_by_id();

        this.get_current_employee_performance();

        // this.loadKPIs();

        // this.$nextTick(function () {
        // code that assumes this.$el is in-document
        //readmore
        this.get_current_organization();
        // var md1 = new MobileDetect(window.navigator.userAgent);
        // if (md1.mobile()) {//if is mobile
        //     $('#company-vision').readmore({
        //         collapsedHeight: 100,
        //         moreLink: '<a href="#"> <i class="fa fa-angle-double-right"></i> ' + ("Read more") + '</a>',
        //         lessLink: '<a href="#"> <i class="fa fa-angle-double-up"></i> ' + gettext("Less") + '</a>'
        //     });
        // }
        // $('#company-mission').readmore({
        //     collapsedHeight: 200,
        //     moreLink: '<a href="#"> <i class="fa fa-angle-double-right"></i> ' + gettext("Read more") + '</a>',
        //     lessLink: '<a href="#"> <i class="fa fa-angle-double-up"></i> ' + gettext("Less") + '</a>'
        // });
        this.fetch_exscore();
        this.fetch_current_user_profile();
        var p = JSON.parse(localStorage.getItem('history_search_u'));
        if (p == null) localStorage.removeItem('history_search');
        this.storage_user = (p == null) ? [] : JSON.parse(localStorage.getItem('history_search'))[p.indexOf(COMMON.UserRequestEmail)] || [];
        // this.is_user_system = (COMMON.IsAdmin == 'True' || COMMON.IsSupperUser == 'True') ? true : false;
        this.get_surbodinate();
        this.same_user = (COMMON.UserRequestID == COMMON.UserViewedId) ? true : false;  // -> hot fix, has_perm(KPI__EDITING) => actor == target cho phep nhan vien tu chinh sua kpi, nhung logic moi thi khong cho phep
        this.get_surbodinate_user_viewed();
        // });



        $('#edit-all-weight-modal').on('show.bs.modal',function () {
            $(this).focus();

        })


    },
    filters: {
        //marked: marked
        // type_ico_url: function(type){
        //     var doc_type = ['docx','pdf','xls','xlsx','doc'];
        //     var img_type = ['jpg', 'jpeg', 'bmp', 'png'];
        //
        //     var type = type.split('.');
        //     if(doc_type.indexOf(type[type.length -1 ].toLowerCase()) > -1){
        //         return COMMON.StaticUrl+'images/ico-document-format.png';
        //     }
        //     if(img_type.indexOf(type[type.length -1 ].toLowerCase()) > -1){
        //         return COMMON.StaticUrl+'images/ico-image-format.png';
        //     }
        // },
        // type_ico: function(type){
        //     var img_type = ['jpg', 'jpeg', 'bmp', 'png'];
        //
        //     var type = type.split('.');
        //     if(img_type.indexOf(type[type.length -1 ].toLowerCase()) > -1){
        //         return true;
        //     }
        //     return false;
        // },

        // comment out this, move to methods because: https://stackoverflow.com/questions/42828664/access-vue-instance-data-inside-filter-method
        // percent_progressbar: function(kpi_id){
        //     return this.kpi_list[kpi_id].latest_score*100/this.organization.max_score;
        // }
    },
    watch: {
        quarter_by_id:{

            handler:function(val, oldVal){
                this.get_user_smap();
            }
        },
        user_smap:{

            handler:function(val, oldVal){
                this.get_list_kpi_group();
            }
        },
        list_kpi_group:{

            handler:function(val, oldVal){
                // get kpi of each group
                let that = this;
                let kpi_group_need_to_load_kpis={};
                let kpi_groups_need_to_load_kpis = [];
                let all_kpi_groups=[];

                let kpi_ungroup_need_to_load_kpis={};
                let kpi_ungroups_need_to_load_kpis = [];
                let all_kpi_ungroups=[];

                let categories = Object.keys(this.list_kpi_group);

                categories.forEach(function(category){
                    // that.list_kpi_group[category].group_kpis --> Array
                    that.list_kpi_group[category].group_kpis.forEach(function(kpi_group){
                        all_kpi_groups.push(kpi_group);
                    });

                    that.list_kpi_group[category].ungroup_kpis.forEach(function(kpi_ungroup){
                        all_kpi_ungroups.push(kpi_ungroup);
                    });

                });

                // array
                kpi_groups_need_to_load_kpis = all_kpi_groups.filter(function(kpi_group){
                    return kpi_group.is_loaded_kpis ===  undefined || kpi_group.is_loaded_kpis === false
                });
                kpi_groups_need_to_load_kpis.forEach(function(kpi_group){
                    kpi_group_need_to_load_kpis = kpi_group;
                    that.get_kpis_by_group(kpi_group_need_to_load_kpis);
                });

                // array
                kpi_ungroups_need_to_load_kpis = all_kpi_ungroups.filter(function(kpi_ungroup){
                    return kpi_ungroup.is_loaded_kpis ===  undefined || kpi_ungroup.is_loaded_kpis === false
                });
                kpi_ungroups_need_to_load_kpis.forEach(function(kpi_ungroup){
                    kpi_ungroup_need_to_load_kpis = kpi_ungroup;
                    that.get_ungroup_kpis(kpi_ungroup_need_to_load_kpis);
                });

            }
        },




        kpi_list: {
            handler: function (val, oldVal) {
                this.calculate_total_weight();
                // this.getListGroupV2();
                // this.getListGroup();
            }
            //,deep: true <-- slow
        },
        'current_quarter': {
            handler: function (val, oldVal) {
                var that = this
                this.$children.map(function (elem, index, children_arr) {
                    elem.$emit('fetch_current_quarter', val);
                })
            }
        },
        'organization': {
            handler: function (newVal, oldVal) {
                // alert('organization changed');
                var that = this
                that.$emit('update_lock_exscore_review', newVal.monthly_review_lock)
                that.$set(that.company_params,  'ceo_id', newVal.ceo)
                that.get_company_performance(that.company_params)
            }
        },
        // selected_tags: {
        //     handler: function (newVal, oldVal) {
        //         this.search_kpi_library();
        //     }
        // },
        // searched_kpis: {
        //
        // }
    },
    created: function(){

        try{
            ELEMENT.locale(ELEMENT.lang[COMMON.LanguageCode]);
        }
        catch (e){
            console.log(e);
        }
        var that = this;


        // // https://vuejs.org/v2/guide/migration.html#Events
        // // The events option has been removed.
        // // Event handlers should now be registered in the created hook instead.


        this.$on('change_category', function(kpi_id) {
            that.change_category(kpi_id);
        });
        this.$on('get_children_kpis', function(kpi_id) {
            that.get_children_v2(kpi_id);
        });
        this.$on('set_month_target_from_last_quarter_three_months_result', function(kpi_id) {
            that.set_month_target_from_last_quarter_three_months_result(kpi_id);
        });
        this.$on('show_unique_code_modal', function(kpi_id) {
            that.show_unique_code_modal(kpi_id);
        });

        this.$on('init_data_align_up_kpi', function(user_id, kpi_id, bsc_category) {
            that.init_data_align_up_kpi(user_id, kpi_id, bsc_category);
        });
        this.$on('update_evidence_event_callback', function(kpi_id, month, count) {
            that.update_evidence_event_callback(kpi_id, month, count);
        });
        this.$on('showModal_e', function(month_number, kpi_id) {
            that.showModal_e(month_number, kpi_id);
        });

        this.$on('update_list_child_kpis', function(parent_kpi, list_children_kpis) {
            that.update_list_child_kpis(parent_kpi, list_children_kpis);
        });

        this.$on('change_group', function(kpi) {
            that.change_group(kpi);
        });

        this.$on('fetch_user_exscore', function () {
            that.fetch_exscore();
        });


        this.$on('show__add_kpi_methods_modal', function () {
            // show_modal_add_kpi
            // alert('show__add_kpi_methods_modal in root');
            that.show__add_kpi_methods_modal();
        });
        this.$on('show__new_kpi_by_category_modal', function () {
            that.show__new_kpi_by_category_modal();
        });

        this.$on('show__new_kpi_by_kpilib_modal', function () {
            // show_kpilib
            that.show__new_kpi_by_kpilib_modal();
        });



        this.$on('add_new_kpi_by_category', function (category) {
            that.add_new_kpi_by_category(category);
        });
        this.$on('add_new_kpi_from_kpi_lib', function (kpi) {

            that.add_new_kpi_from_kpi_lib(kpi);
        });

        this.$on('add_child_kpi', function (parent_kpi_id) {

            that.add_child_kpi(parent_kpi_id);
        });


        this.$on('update_kpi', function (kpi, show_blocking_modal, callback) {
            that.update_kpi(kpi, show_blocking_modal, callback);
        });

        this.$root.$on("adjust_performance_level", function(kpi_id) {
            that.adjust_performance_level(kpi_id)
        })
        this.$on('kpi_reloaded', function (kpi_data) {
            that.update_data_on_kpi_reloaded(kpi_data);
        });
        this.$on('parent_kpi_added', function(added_kpi, kpi_group){
            /*
            * kpi_group
            *
            * {"category":"financial","map":166,"group":true,"name":"A","kpis":[],"id":1410}
            *
            * */
            /*
            * added_kpi
            * {
                "code": "",
                "unique_key": "5b8f564e-01ca-11e9-9ae4-1002b5cd852f",
                "owner_email": "cjs_genco3@cjs.vn",

                "children": [],
                "real": null,
                "month_1_target": null,
                "kpi_refer_group": "new-group",
                "kpi_id": "F2.2",
                "archivable_score": 8,
                "is_private": false,
                "name": "B",
                "group_kpi": 1562,

                "created_at": "2018-12-17T14:07:04.266",
                "prefix_id": "F2.2",
                "copy_from": null,
                "children_data": null,
                "assigned_to": null,
                "latest_score": 0.0,
                ....
              },


            *
            * */

            that.update_list_kpi_group_on_parent_kpi_added(kpi_group, added_kpis);
        });
        this.$on('parent_kpi_removed', function (kpi_id) {
            that.update_data_on_kpi_removed(kpi_id);
        });
        this.$on('toggle_weight_kpi', function (kpi_id) {
            that.toggle_weight_kpi(kpi_id);
        });

        this.$on('update_data_kpi', function (kpi,  property_name, input_data) {
            that.update_data_kpi(kpi,  property_name, input_data);
        });
        // nguyen
        this.$on('update-kpi-group-name', function (data_group) {
            that.update_kpi_group_name(data_group);
        });
        // nguyen 2
        this.$on('remove-group-kpi', function (data_group) {
            that.remove_group_kpi(data_group);
        });
        // nguyen 3
        this.$on('set-current-group-kpi-to-add-kpi', function (data_group) {
            that.selected_group_kpi = data_group;
            that.$refs.addGroupAndKpi.show_modal_add_kpi();
        });
        // nguyen 4
        this.$on('move-kpi-to-new-group-kpi', function (data_kpi) {
            that.move_kpi_to_new_group_kpi(data_kpi);
        });

    },
    methods: {
        update_data_kpi: function(kpi,  property_name, input_data){
            return kpi;
            // var that = this;
            // switch (property_name) {
            //     case 'quarter_target':
            //         kpi.quarter_one_target = input_data[0].value;
            //         kpi.quarter_two_target = input_data[1].value;
            //         kpi.quarter_three_target = input_data[2].value;
            //         kpi.quarter_four_target = input_data[3].value;
            //         break;
            //     case 'month_target':
            //         kpi.month_1_target = input_data[0].value;
            //         kpi.month_2_target = input_data[1].value;
            //         kpi.month_3_target = input_data[2].value;
            //         break;
            //     case 'month_real':
            //         kpi.month_1 = input_data[0].value;
            //         kpi.month_2 = input_data[1].value;
            //         kpi.month_3 = input_data[2].value;
            //         break;
            // }
            // return kpi;
        },

        // update_kpi_property: function(kpi, property_name, callback = null){
        //     var that = this;
        //     var url='';
        //     switch (property_name) {
        //         case 'quarter_trget':
        //             url = `/api/v2/kpi/${kpi.id}/update-quarter-target/` ; // Endpoint update four quarters;
        //             break;
        //         case 'month_target':
        //             url = COMMON.LinkKPISevices ;// Endpoint update 3 months target;
        //             kpi.command = 'update_month_target';
        //             break;
        //         case 'month_real':
        //             url = '/performance/kpi/update-score/' ; // Endpoint update 3 months score;
        //             break;
        //         case 'score_calculation_type':
        //             url = `/api/v2/kpi/${kpi.id}/update-score-calculation-type/` ;// Endpoint update score_calculation;
        //             break;
        //         case 'operator':
        //              url = '/performance/kpi/update-score/' ; // Endpoint update operator;
        //             break;
        //     }
        //     if(property_name == 'month_target' && !kpi.enable_edit && !that.organization.allow_edit_monthly_target){
        //         guide_requestcenter(gettext("You don't have permission to edit month target"));
        //         return;
        //     }else if(property_name == 'month_real' && !kpi.enable_review) {
        //         guide_requestcenter(gettext("Not allowed to modify KPI, please check if any wrong data in KPI"));
        //         return;
        //     }
        //     cloudjetRequest.ajax({
        //         url: url,
        //         type: 'POST',
        //         data: JSON.stringify(kpi),
        //         contentType: "application/json",
        //         success: function(data){
        //             that.kpi_list[kpi.id] = Object.assign(that.kpi_list[kpi.id], data);
        //             if(property_name == 'month_real'){
        //                 that.kpi_list[kpi.id] = Object.assign(that.kpi_list[kpi.id], data.kpi);
        //                 that.$set(that.kpi_list[kpi.id], 'latest_score', data.score);
        //                 that.$set(that.kpi_list[kpi.id], 'real', data.real);
        //                 that.kpi_list[kpi.id].target = data.kpi.target;
        //                 that.triggeredReloadTargetPerformance(kpi.id);
        //                 that._reload_kpi(kpi.id);
        //             }
        //             that.get_current_employee_performance();
        //             $(".save-btn-calculation").hide();
        //             success_requestcenter(gettext("Update successful!"));
        //         },
        //         error: function(jqxhr){
        //         },
        //     });
        //     if (typeof callback === 'function') {
        //         callback();
        //     }
        // },



        // nguyen
        update_kpi_group_name: function(data_group){
            let that = this;
            let group_index = that.find_indexof_group_in_list_kpi_group(data_group);
            that.$set(that.list_kpi_group[data_group.category].group_kpis[group_index], 'name', data_group.name);
        },
        // nguyen 2
        remove_group_kpi: function(data_group){
            let that = this;
            let group_index = that.find_indexof_group_in_list_kpi_group(data_group);
            that.$delete(that.list_kpi_group[data_group.category].group_kpis.splice(group_index, 1));
        },
        // nguyen 3
        fetch_data_group_KPI: function(data_group){
            var that = this;
            data_group.kpis.forEach(function(kpi){
                that.$set(that.kpi_list, kpi.id, kpi)
            })
        },
        // nguyen 4
        move_kpi_to_new_group_kpi: function(data_kpi){
            var that = this;
            that._reload_kpi(data_kpi.id);
        },
        get_kpis_by_group: function(kpi_group){
            let that = this;
            // sample url:
            // http://cjs.localhost:8000/api/v2/strategy-map/group/624/?include_children=false
            // find group in group_kpis to be update kpis
            let group_index = that.find_indexof_group_in_list_kpi_group(kpi_group);

            let jqxhr = cloudjetRequest.ajax({
                url: `/api/v2/strategy-map/group/${kpi_group.id}/?include_children=false`,
                type: 'get',
                success: function (group_kpis_data, statusText, jqXHR) {
                    /* Sample data
                    [
                     { // kpi data
                        code: "",
                        unique_key: "bc94a13a-7ed5-11e6-9202-4a540f0c059b",
                        owner_email: "lamdq@demo.cjs.vn",
                        enable_review: true,
                        get_score_icon: "/static/img/kpi/good-performance.png",
                        unique_code: null,
                        default_real: null,
                        reviewer: null,
                        children: [ ],
                        group: null,
                        ....
                     },
                     {
                        // kpi data
                     },
                     ...
                    ]
                     */

                    /*
                    //QUOCDUAN NOTE: DONOT REMOVE THIS LINE
                    that.$set(that.list_kpi_group[kpi_group.category].group_kpis[group_index], 'kpis', group_kpis_data);
                    */

                },
                error: function (e) {
                    alert('cannot get kpis of group ' + kpi_group.name);
                }
            });
            // mark kpi group as loaded kpis data
            jqxhr.done(function(){
                that.$set(that.list_kpi_group[kpi_group.category].group_kpis[group_index], 'is_loaded_kpis', true);
            });

            // TODO: NEED UPDATE parentKPIs
            jqxhr.done(function(){

            });

            // QUOCDUAN NOTE: we use this for old way to handle all kpis in kpi_list object
            // and will be removed in future
            jqxhr.done(function(group_kpis_data, statusText, jqXHR){
                group_kpis_data.kpis.forEach(function(kpi_data){
                    that.$set(that.kpi_list, kpi_data.id, kpi_data);
                });
            });

            return jqxhr;
        },
        get_ungroup_kpis: function(kpi_ungroup){
            let that = this;
            let url = `/api/v2/strategy-map/${this.user_smap.hash}/ungroup-kpis/${kpi_ungroup.category}/?quarter_id=${this.quarter_by_id.id}`;


            let jqxhr = cloudjetRequest.ajax({
                url: url,
                type: 'get',
                success: function (ungroup_kpis_data, statusText, jqXHR) {
                    /* Sample data
                    [
                     { // kpi data
                        code: "",
                        unique_key: "bc94a13a-7ed5-11e6-9202-4a540f0c059b",
                        owner_email: "lamdq@demo.cjs.vn",
                        enable_review: true,
                        get_score_icon: "/static/img/kpi/good-performance.png",
                        unique_code: null,
                        default_real: null,
                        reviewer: null,
                        children: [ ],
                        group: null,
                        ....
                     },
                     {
                        // kpi data
                     },
                     ...
                    ]
                     */


                },
                error: function (e) {
                    alert('cannot get ungroup-kpis');
                }
            });
            // mark kpi group as loaded kpis data
            jqxhr.done(function(){
                that.$set(that.list_kpi_group[kpi_ungroup.category].ungroup_kpis[0], 'is_loaded_kpis', true);
            });

            // TODO: NEED UPDATE parentKPIs
            jqxhr.done(function(){

            });

            // QUOCDUAN NOTE: we use this for old way to handle all kpis in kpi_list object
            // and will be removed in future
            jqxhr.done(function(ungroup_kpis_data, statusText, jqXHR){
                ungroup_kpis_data.forEach(function(kpi_data){
                    that.$set(that.kpi_list, kpi_data.id, kpi_data);
                });
            });

            return jqxhr;
        },

        find_indexof_group_in_list_kpi_group: function(kpi_group){
            let that = this;
            let found_index = -1;
            let kpi_groups = this.list_kpi_group[kpi_group.category].group_kpis;
            // Note: The findIndex() method is not supported in IE 11 (and earlier versions).
            // The findIndex() method returns the index of the first element in an array that pass a test (provided as a function).
            found_index = kpi_groups.findIndex(function(current_kpi_group, index, arr){
                return current_kpi_group.id == kpi_group.id
            });
            return found_index
        },
        find_indexof_kpi_in_kpi_group: function(kpi, kpi_group){
            let that = this;
            let found_index = -1;

            // Note: The findIndex() method is not supported in IE 11 (and earlier versions).
            // The findIndex() method returns the index of the first element in an array that pass a test (provided as a function).
            found_index = kpi_group.kpis.findIndex(function(current_kpi, index, arr){
                return current_kpi.id == kpi.id
            });
            return found_index
        },
        find_indexof_kpi_in_kpi_list: function(kpi_id){
            let that = this;
            let found_index = -1;

            // Note: The findIndex() method is not supported in IE 11 (and earlier versions).
            // The findIndex() method returns the index of the first element in an array that pass a test (provided as a function).
            found_index = Object.values(this.kpi_list).findIndex(function(current_kpi, index, arr){
                return current_kpi.id == kpi_id
            });
            return found_index
        },


        get_user_smap: function(){
            let that = this;
            // sample url:
            // http://cjs.localhost:8000/api/v2/strategy-map/?user_id=12
            // http://cjs.localhost:8000/api/v2/strategy-map/?user_id=12&quarter_id=6

            let current_user_id=COMMON.UserViewedId;

            // TODO: need check for case of view KPIs of other quarter
            // var quarter_by_id=this.quarter_by_id;
            let quarter_id = this.quarter_by_id.id;


            let jqxhr = cloudjetRequest.ajax({
                url: `/api/v2/strategy-map/?user_id=${current_user_id}&quarter_id=${quarter_id}`,
                type: 'get',
                success: function (smap_data, statusText, jqXHR) {
                    /* Sample data
                    {
                        hash: "strategymap-ZCoTy",
                        name: "",
                        quarter_period: 7,
                        created_at: "2017-05-16T23:02:02.225322",
                        director: 12,
                        year: 2017,
                        organization: 1,
                        removed: null,
                        id: 161,
                        description: ""
                    }
                     */
                    that.user_smap=smap_data;
                },
                error: function (e) {
                    alert('cannot get user map');
                }
            });

            return jqxhr;

        },

        get_list_kpi_group: function(){
            let that = this;
            // example url:
            // * get  kpisgroup by category:
            // http://cjs.localhost:8000/api/v2/strategy-map/group/?hash=strategymap-lip4o&bsc_category=financial&include_kpi=false
            // * get all kpi groups:
            // http://cjs.localhost:8000/api/v2/strategy-map/group/?hash=strategymap-lip4o&include_kpi=false

            let hash=this.user_smap.hash;


            // get all kpi groups
            let jqxhr = cloudjetRequest.ajax({
                url: `/api/v2/strategy-map/group/?hash=${hash}&include_kpi=false`,
                type: 'get',

                success: function (list_kpi_group_data, statusText, jqXHR) {
                    // that.list_kpi_group =  list_kpi_group_data;
                    that.$set(that, 'list_kpi_group', list_kpi_group_data);

                },
                error: function (e) {
                    alert('error: cannot get kpi groups');
                }
            });
            return jqxhr;

        },


        to_percent: function (val, total) {
            if (total > 0) {
                return val * 100 / total;
            }
            return "";
        },
        toggle_weight_kpi:function (kpi_id) {

            var that = this;
            var kpi=this.kpi_list[kpi_id];
            this.reason_kpi = '';
            this.check_submit_reason = false;
            this.check_reason();
            var reason = this.get_reason_delay_kpi();
            // weight = weight.replace(',', '.');
            weight = kpi.weight;
            this.active_kpi_id = kpi_id;

            this.checkChild(this.active_kpi_id); // CHECK kpi nay la kpi cha hay kpi con
            this.constructOldWeight();


            if (parseFloat(weight) !== 0.0) {
                this.kpi_list[kpi_id].old_weight = parseFloat(weight);
                $('#modalReason').modal('show');
            } else {
                var data = {'id': kpi_id, 'command': 'active_kpi', 'reason': reason};
                swal({
                    title: "Kích hoạt KPI",
                    type: "warning",
                    showCancelButton: true,
                    cancelButtonText: "Hủy",
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: "Đồng ý",
                    closeOnConfirm: true
                }, function () {
                    cloudjetRequest.ajax({
                        url: '/api/kpi/services/',
                        type: 'post',
                        data: data,
                        success: function (data, statusText, jqXHR) {
                            if (jqXHR.status === 200) {
                                console.log(data);
                                //add performance for employee
                                that.get_current_employee_performance();
                                that._reload_kpi(kpi_id);
                            } else {
                                swal(gettext('Not successful'), gettext('Cannot delay/active this kpi'), "error");
                            }
                            // $scope.calculate_score(kpi);
                        },
                        error: function (e) {
                            //alert('Cannot delay/active this kpi!');
                            //console.log(e )
                            //swal("Không thành công", jqXHR.responseJSON.message, "error");
                            if (e.responseJSON.message != "" || e.responseJSON.message != null || e.responseJSON.message != undefined){
                                swal(gettext('Not successful'),  e.responseJSON.message, "error");
                            }
                            else{
                                swal(gettext('Not successful'), gettext('Cannot delay/active this kpi'), "error");
                            }
                        }
                    });
                });
            }

        },
        confirm_toggle_weigth_kpi:function (kpi_id) {

            var that = this;
            var kpi_id = this.active_kpi_id;
            var reason = this.get_reason_delay_kpi();
            this.status_error = false;
            var data = {'id': kpi_id, 'command': 'delay_toggle', 'reason': reason};
            cloudjetRequest.ajax({
                url: '/api/kpi/services/',
                type: 'post',
                data: data,
                success: function (data) {

                    // var root = $(v.get_root_kpi_wrapper(kpi_id));
                    // $(root).reload_kpi_anchor();
                    that._reload_kpi(kpi_id);

                    that.update_kpis(kpi_id);
                },
                error: function () {

                    that.status_error = true;
                    that.message_error = gettext('You do not have permission to delay this KPI!')
                    //alert('Cannot delay/active this kpi!');
                },
                complete: function (jqXHR) {

                }
            });
        },
        update_data_on_kpi_removed: function(kpi_id){

            let found_index = -1;



            if (kpi_id){
                found_index = this.find_indexof_kpi_in_kpi_list(kpi_id);
                if (found_index != -1){
                    this.$delete(this.kpi_list, kpi_id);
                    this.get_current_employee_performance();
                }

            }

        },



        remove_kpi_data: function(kpi_id){
            // alert('remove_kpi_data');
            var that = this;
            var child_kpis=that.get_child_kpis_from_kpi_list(kpi_id);
            if (child_kpis.length > 0){
                child_kpis.forEach(function(kpi){
                    that.remove_kpi_data(kpi.id)
                });
            }

            if (that.kpi_list[kpi_id]) {
                that.$delete(that.kpi_list, kpi_id);
            }


        },
        update_data_on_kpi_reloaded: function(kpi_data){

            var that = this;

            var update_kpi_data=function (kpi) {
                if (kpi.children && kpi.children.length > 0){
                    kpi.children.forEach(function(k){
                        update_kpi_data(k);
                    });

                }
                that.$set(that.kpi_list, kpi.id, kpi);
            };

            if (kpi_data){
                // alert('that.remove_kpi_data(kpi_data.id);');
                that.remove_kpi_data(kpi_data.id);


                // alert('set new data after reload kpi');
                update_kpi_data(kpi_data);
                // this.kpi_list[]
            }

            /*
            // QUOCDUAN NOTE: THIS FOR FUTURE USE
            // DONT REMOVE THIS
            if (kpi_data) {
                let kpi = kpi_data;
                let kpi_group_data = {
                    'id': kpi.group_kpi,
                    'category': kpi.bsc_category
                };
                // TODO: NEED REFACTOR CODE HERE TO prevent error of: Index out of range
                let group_index = this.find_indexof_group_in_list_kpi_group(kpi_group_data);
                let kpi_group = this.list_kpi_group[kpi_group_data.category].group_kpis[group_index];
                let kpi_index_in_group = this.find_indexof_kpi_in_kpi_group(kpi, kpi_group);

                // remove old & update new kpi data
                this.$set(this.list_kpi_group[kpi_group_data.category].group_kpis[group_index], kpi_index_in_group, kpi);
            }
            */




        },




        // get_kpis_by_group:function(group){
        //     // {#    v-if="parentKPIs[kpi.id] !== undefined && (kpi.bsc_category + kpi.kpi_refer_group) == group.slug"#}
        //     var kpis={}
        //     Object.keys(parentKPIs).forEach(function(key, index){
        //         var kpi=parentKPIs[key];
        //         if((kpi.bsc_category + kpi.kpi_refer_group) == group.slug){
        //            kpis[key]=kpi;
        //         }
        //     });
        //     return kpis;
        //
        // },

        show__new_kpi_by_category_modal: function(){
            this.hide__add_kpi_methods_modal();
            $('#new-kpi-by-category-modal').modal('show');

        },
        show__new_kpi_by_kpilib_modal: function(){
            this.hide__add_kpi_methods_modal();
            // $('#new-kpi-by-kpilib-modal').modal('show');
            $('#modal-kpi-lib').modal('show');
        },


        show__add_kpi_methods_modal: function(){
            $('#add-kpi-methods-modal').modal('show');
        },
        hide__add_kpi_methods_modal: function(){
            $('#add-kpi-methods-modal').modal('hide');
        },
        hide__new_kpi_by_category_modal:function(){
            $('#new-kpi-by-category-modal').modal('hide');
        },

        add_child_kpi: function(parent_kpi_id){
            var that=this;
            var kpi_data={
                parent_kpi_id:parent_kpi_id
            };

            var jqXhr=this.add_kpi(false, kpi_data);

            // additional success callback function
            jqXhr.done(function(){
                that.$set(that.kpi_list[parent_kpi_id], 'has_child', true);
                that.$set(that.kpi_list[parent_kpi_id], 'children_data', {'parent_score_auto': true});
                // $('#btn-kpi-toggle'+kpi).children('i.fa').removeClass("fa-angle-double-right").addClass("fa-angle-double-down");
            });


        },
        add_new_kpi_by_category:function(category){
            let that=this;
            let kpi_data={
                'category':category
            };
            let jqXhr=this.add_kpi(false, kpi_data);
            jqXhr.done(function () {
                that.hide__new_kpi_by_category_modal();
            });
            jqXhr.done(function(){
                let added_kpi='';
                let kpi_group = '';
                that.$emit('parent_kpi_added', added_kpi, kpi_group);
            });

        },
        add_new_kpi_from_kpi_lib: function (k) {
            $(".btn-add-kpilib").button("loading");

            var jqXhr = this.add_kpi(true, k);
            jqXhr.done(function(){
                let added_kpi='';
                let kpi_group = '';
                that.$emit('parent_kpi_added', added_kpi, kpi_group);
            });

            jqXhr.complete(function () {
                $(".btn-add-kpilib").button("reset");
                swal({
                    type: 'success',
                    title: gettext('Add KPI successfully'),
                    text: k.name + gettext(' has been added successfully to the category ') + COMMON.BSCCategory[k.category] ,
                    showConfirmButton: false,
                    customClass: 'add-kpi-success',
                    timer: 3000,
                });
            });

        },
        update_list_kpi_group_on_parent_kpi_added: function( kpi_group, added_kpis){
            // called by event handler
            // list_kpi_group.{{ category_key }}.group_kpis
            let that = this;

            if (added_kpis && added_kpis.length > 0){
                added_kpis.forEach(function(added_kpi){
                    // that.$set(that.kpi_list, added_kpi.id, added_kpi);
                    // TODO: NEED TO RE-ORGANIZE CODE HERE FOR CLEANER FUNCTIONALITY ON EACH FUNCTION
                    that.update_data_on_kpi_reloaded(added_kpi); // simple trick :D
                });
            }

            if (kpi_group){
                // find group on list_kpi_group
                let kpi_group_index = this.find_indexof_group_in_list_kpi_group(kpi_group)
                if (kpi_group_index != -1){ // mean existing kpi_group, not newly added
                    // do nothing
                    // accessible path: this.list_kpi_group.[kpi_group.category].group_kpis[kpi_group_index]
                    // TODO: NEED CHECK THIS CASE THE NEWLY CREATED KPI IS RENDERED?

                }else{ // newly added kpi-group
                    kpi_group.is_loaded_kpis = true;
                    this.list_kpi_group[kpi_group.category].group_kpis.push(kpi_group);
                }
            }
        },


        add_kpi:function(from_kpilib=false, kpi_data){
            var that = this;

            // var level = 1;
            var data = {
                'from_kpilib':from_kpilib,
                'kpi_data': JSON.stringify(kpi_data),
                // 'parent_kpi': kpi_data,
                // 'level': level,
                // 'new_template': true
            };





            var jqXhr=cloudjetRequest.ajax({
                url: location.pathname,
                type: 'post',
                data: data,
                success: function (response) {
                    let new_kpi_data = response.data;

                    that.$set(that.kpi_list, new_kpi_data.id, new_kpi_data);

                },
                error: function () {
                }
            });
            return jqXhr;
        },


        // depricated
        update_list_child_kpis:function(parent_kpi, list_children_kpis){
            var that = this;
            // alert('update_list_child_kpis function');
            list_children_kpis.forEach(function(child_kpi){
                that.$set(that.kpi_list, child_kpi.id, child_kpi);
            });
        },
        childrenKPIs: function(kpi_id){
            if (this.kpi_list[kpi_id]){
                return this.kpi_list[kpi_id].children
            }
            return []

        },

        percent_progressbar: function(kpi_id){
            return this.kpi_list[kpi_id].latest_score*100/this.organization.max_score;
        },

        type_ico_url: function(type){
            var doc_type = ['docx','pdf','xls','xlsx','doc'];
            var img_type = ['jpg', 'jpeg', 'bmp', 'png'];

            var type = type.split('.');
            if(doc_type.indexOf(type[type.length -1 ].toLowerCase()) > -1){
                return COMMON.StaticUrl+'images/ico-document-format.png';
            }
            if(img_type.indexOf(type[type.length -1 ].toLowerCase()) > -1){
                return COMMON.StaticUrl+'images/ico-image-format.png';
            }
        },
        type_ico: function(type){
            var img_type = ['jpg', 'jpeg', 'bmp', 'png'];

            var type = type.split('.');
            if(img_type.indexOf(type[type.length -1 ].toLowerCase()) > -1){
                return true;
            }
            return false;
        },
        // unused
        // toggleKPIs:function(selector) {
        //
        //     $('[data-group-header-slug='+selector+']').toggleClass('show-group');
        //
        //
        //
        //     if ($('[data-group-header-slug='+selector+']').hasClass('show-group')){
        //         $('[data-group-kpis='+selector+']').slideDown();
        //         $('span#show.btn-kpi-toggle-refer' + selector).hide();
        //         $('span#hide.btn-kpi-toggle-refer' + selector).show();
        //     }
        //     else{
        //         $('[data-group-kpis='+selector+']').slideUp();
        //         $('span#show.btn-kpi-toggle-refer' + selector).show();
        //         $('span#hide.btn-kpi-toggle-refer' + selector).hide();
        //     }
        //
        // },
        constructOldWeight: function(){
            var self = this;
            var kpis = JSON.parse(JSON.stringify(self.kpi_list));
            for(var kpi_id in kpis){
                kpis[kpi_id].old_weight = kpis[kpi_id].weight;
            }
            self.kpi_list = kpis;
        },
        inputKPIWeight: function(val){
            var self = this;
            if (parseFloat(val) === 0){

            }
        },
        findGroupBySlug: function(slug,dataSource){
            var self = this;
            var listGroups = Object.keys(dataSource).map(function(elm){
                return dataSource[elm]
            })
            var groups = listGroups.slice().filter(function(elm){
                return elm.slug === slug
            })
            return groups;
        },
        findGroupByID: function(id,dataSource){
            var self = this;
            var listGroups = Object.keys(dataSource).map(function(elm){
                return parseInt(dataSource[elm].id)
            })
            var found = listGroups.indexOf(parseInt(id))
            return found;
        },





        compareArrays:function(arr1, arr2) {
            // only for array of string values. Other types was not test
            return $(arr1).not(arr2).length == 0 && $(arr2).not(arr1).length == 0
        },

        formatWeight: function (val) {
            if (typeof val == 'number') {
                return val.toFixed(2);
            }
        },


        delete_all_kpis: function () {
            var that = this;
            cloudjetRequest.ajax({
                method: "POST",
                url: '/api/kpi/services/',
                data: {
                    'command': 'delele_all_kpis',
                    'user_id': COMMON.UserViewedId,
                    'email': that.email_confirm
                },
                success: function (data) {
                    window.location.reload(true);
                },
            })
        },

        hide_modal: function (modal_id) {
            $(modal_id).modal('hide');
        },
        check_email_delete: function () {
            var email = this.email_confirm.replace(/\s/g,'');
            if (email.length == COMMON.UserViewedEmail.length && email == COMMON.UserViewedEmail ){
                this.status_confirm = false;
            }else{
                this.status_confirm = true;
            }
        },

        reset_modal_delete: function () {
            var that = this;
            that.status_confirm = true;
            that.email_confirm = '';
        },
        // search_kpi_library: function (page=null) {
        //
        // },
        fetch_kpi_tag: function (children_data_object, kpi_child_id) {
            var kpi_tag = [];
            try {
                var tag_index = children_data_object.children_weights.map(function (elm, index) {
                    return elm.kpi_id;
                }).indexOf(kpi_child_id);
                kpi_tag = children_data_object.children_weights[tag_index].relation_type;

            } catch (e) {
                console.log(e)
            }
            return Object.assign([], kpi_tag);
        },
        update_relation_type_object: function (children_data_object, kpi_id) {
            var self = this;
            var cloned_children_data_object = Object.assign({}, children_data_object);
            var cloned_relation_type = Object.assign([], self.tag_list[kpi_id]);
            var relation_index = children_data_object.children_weights.map(function (elm) {
                return elm.kpi_id;
            }).indexOf(kpi_id);
            cloned_children_data_object.children_weights[relation_index].relation_type = cloned_relation_type;
            return cloned_children_data_object;
        },
        open_tag_input: function (kpi_id) {
            var self = this;
            var elm_wrapper = $("#tag-wrapper-" + kpi_id);
            var temp_relation_type = Object.assign([], self.tag_list[kpi_id]);
            self.$set(self.$data, 'tempo_relation_type[' + kpi_id + ']', temp_relation_type);
            if (!elm_wrapper.hasClass('input')) {
                elm_wrapper.addClass('input');
                ;
                $('#tag-wrapper-' + kpi_id + ' input').focus();
                self.$set(self.$data, 'tag_' + kpi_id, true);
            }
        },
        close_tag_input: function (kpi_id) {
            var self = this;
            var elm_wrapper = $("#tag-wrapper-" + kpi_id);
            if (elm_wrapper.hasClass('input')) {
                elm_wrapper.removeClass('input');
                self.$set(self.$data, 'tag_' + kpi_id, false);
            }
            var refer_to_id = self.kpi_list[kpi_id].refer_to;
            var data = self.update_relation_type_object(self.kpi_list[kpi_id].parent_children_data, kpi_id);
            console.log(data)
            cloudjetRequest.ajax({
                method: 'post',
                url: '/api/v2/kpi/children_weights/' + refer_to_id + '/',
                data: JSON.stringify(data),
                success: function (data) {
                    self.$set(self.$data, 'kpi_list[' + kpi_id + '].parent_children_data', data);
                    self.$set(self.$data, "tag_list[" + kpi_id + ']', self.fetch_kpi_tag(data, kpi_id))
                }
            });
        },
        cancel_tag_input: function (kpi_id) {
            var self = this;
            var elm_wrapper = $("#tag-wrapper-" + kpi_id);
            if (elm_wrapper.hasClass('input')) {
                elm_wrapper.removeClass('input');
                self.$set(self.$data, 'tag_' + kpi_id, false);
            }
            self.$set(self.$data, 'tag_list[' + kpi_id + ']', self.tempo_relation_type[kpi_id])
        },
        display_tag: function (kpi_id) {
            var self = this;
            if (self.tag_list[kpi_id].length === 0) self.tag_list[kpi_id].push(self.tag_input);
            else {

            }
            self.tag_input = '';
        },
        get_children_refer_by_id: function (kpi_id) {
            var self = this;
            var kpi_index = self.current_children_data.refer_kpis.map(
                function (elem) {
                    return elem.id;
                }
            ).indexOf(kpi_id);
            return self.current_children_data.refer_kpis[kpi_index];
        },
        get_children_v2: function (kpi_id) {
            // Pace.start();
            var self = this;
            cloudjetRequest.ajax({
                type: 'get',
                url: '/api/v2/kpi/children_weights/' + kpi_id + '/',

                success: function (data) {

                    data['parent_kpi_id'] = kpi_id;
                    data['edit'] = false;
                    self.current_children_data=Object.assign({}, data);
                    // self.$set(self.$data, 'current_children_data', data);
                    self.$set(self.kpi_list[kpi_id], 'children_data', data.children_data)
                    self.parent_score_auto = data.children_data.parent_score_auto;
                    // self.$set(self.$data, 'kpi_list[' + kpi_id + '].children_data', Object.assign({}, data.children_data))
                    console.log(self.current_children_data)
                    // self.$compile(self.$el)
                    $('#childrenKPIModal').modal();
                    //    that.$set(that.$data, 'children_kpis', data.children);
                },
                error: function () {
                    alert('error');
                },
                complete: function (data) {
                    $('.add_kpi').show();
                }
            });

        },
        confirm_switching_autocal: function(close_modal = true) {
            var self = this;
            //  if(self.organization.default_auto_score_parent === true){

            self.current_children_data.children_data.parent_score_auto = this.parent_score_auto;
            self.current_children_data.children_data.children_weights.map(function (elm) {
                elm.weight = parseFloat(elm.weight);
                elm.weight_temp = parseFloat(elm.weight_temp);
                return elm;
            });
            var jqXhr=cloudjetRequest.ajax({
                type: 'post',
                url: '/api/v2/kpi/children_weights/' + self.current_children_data.parent_kpi_id + '/',
                contentType: 'application/json',
                data: JSON.stringify(self.current_children_data.children_data),
                success: function (data) {
                    self.$set(self.kpi_list[self.current_children_data.parent_kpi_id], 'children_data', data);

                    console.log(data);
                    if (close_modal) {
                        $('#childrenKPIModal').modal('hide');

                        // var root = self.get_root_kpi_wrapper(self.current_children_data.parent_kpi_id);
                        // $(root).reload_kpi_anchor();
                        self._reload_kpi(self.current_children_data.parent_kpi_id);
                        self.current_children_data = {};
                    }
                },
                error: function () {
                    alert('error');
                },
                complete: function (data) {
                    $('.add_kpi').show();
                }
            });
            // }
        },
        cancel_switching_autocal: function () {
            var self = this;
            self.current_children_data = {};
        },
        check_status_msg_expired: function () {
            var that = this
            var date_expired = new Date(that.organization.edit_to_date);
            var date_now = new Date();
            var cache_date = [];
            _date_expired = JSON.parse(localStorage.getItem('date_expired'));
            if (_date_expired == null || localStorage.getItem('status_msg_expired') == null) {
                cache_date.push({'day': date_expired.getDate(), 'month': date_expired.getMonth() + 1});
                localStorage.setItem('date_expired', JSON.stringify(cache_date));
                localStorage.setItem('status_msg_expired', false);
            } else if (_date_expired.length > 0 && localStorage.getItem('status_msg_expired') == 'true') {
                var _day = date_expired.getDate();
                var _month = date_expired.getMonth() + 1;
                if (date_expired.getMonth() + 1 == _date_expired[0].month && date_expired.getDate() > _date_expired[0].day) {
                    _day = date_expired.getDate();
                    _month = date_expired.getMonth() + 1;
                    localStorage.setItem('status_msg_expired', false);
                } else if (date_expired.getMonth() + 1 > _date_expired[0].month) {
                    _day = date_expired.getDate();
                    _month = date_expired.getMonth() + 1;
                    localStorage.setItem('status_msg_expired', false);
                }
                cache_date.push({'day': date_expired.getDate(), 'month': date_expired.getMonth() + 1});
                localStorage.setItem('date_expired', JSON.stringify(cache_date));
            }
        },
        get_surbodinate: function () {
            var that = this;
            cloudjetRequest.ajax({
                method: "GET",
                dataType: 'json',
                url: '/api/team/?user_id=' + COMMON.UserRequestID,
                success: function (data) {
                    that.list_surbodinates = data;
                }
            })
        },
        get_surbodinate_user_viewed: function () {
            var that = this;
            cloudjetRequest.ajax({
                method: "GET",
                dataType: 'json',
                url: '/api/team/?user_id=' + COMMON.UserViewedId,
                success: function (data) {
                    that.list_surbodinates_user_viewed = data;
                }
            })
        },
        page_employee: function (user_id, p) {
            var that = this;
            if (p != -1) {
                var _storage = [];
                var _all = [];
                var user_current = (JSON.parse(localStorage.getItem('history_search_u')) != null) ? JSON.parse(localStorage.getItem('history_search_u')) : [];
                var position = user_current.indexOf(COMMON.UserRequestEmail);
                if (position == -1) {
                    user_current.push(COMMON.UserRequestEmail);
                    localStorage.setItem('history_search_u', JSON.stringify(user_current));
                }
                _all = (JSON.parse(localStorage.getItem('history_search')) != null) ? JSON.parse(localStorage.getItem('history_search')) : [];
                _storage = (typeof _all[user_current.indexOf(COMMON.UserRequestEmail)] != 'undefined') ? _all[user_current.indexOf(COMMON.UserRequestEmail)] : [];

                // Check user_id has existed in list
                var has_user = false;
                _storage.forEach(function(e, i){
                    if(that.list_user_searched[p].user_id == e.user_id){
                        if (i>0 && has_user==false){
                            // Move item to first in array
                            var temp = _storage[0];
                            _storage[0] = e;
                            _storage[i] = temp;
                        }
                        has_user = true;
                        return;
                    }
                })
                // If user hasn't in list, push user to list
                if (has_user==false)_storage.insert(0, that.list_user_searched[p]);
                _all[user_current.indexOf(COMMON.UserRequestEmail)] = _storage
                if (_all[user_current.indexOf(COMMON.UserRequestEmail)].length > 3) _all[user_current.indexOf(COMMON.UserRequestEmail)].splice(3, 1);
                localStorage.setItem('history_search', JSON.stringify(_all));
                console.log(_all);
            }
            var url = COMMON.LinkKPIEditorEmp;
            index = url.substr(0, url.length - 1).lastIndexOf('/');
            location.href = url.substr(0, index) + "/" + user_id + "/";
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
                        url: COMMON.LinkSearchPeople + '?all_sublevel=1&limit=10&search_term=' + that.query,
                        success: function (data) {
                            that.list_user_searched = data.suggestions;
                            console.log(that.list_user_searched);
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
        get_total_children_weight: function (children_weight_object) {
            var result = 1;
            if (children_weight_object && children_weight_object.children_data.children_weights.length > 0) {
                result = children_weight_object.children_data.children_weights.reduce(function (prevVal, elm) {
                    return prevVal + parseFloat(elm.weight);
                }, 0)
            }
            return result;
        },
        toggle_adjusting_estimation: function () {
            var self = this;
            // self.$set('adjusting_kpi.enable_estimation', !self.adjusting_kpi.enable_estimation)
            self.$set(self.$data, 'adjusting_kpi.enable_estimation', !self.adjusting_kpi.enable_estimation)
            if (self.adjusting_kpi.enable_estimation === true) {
                $('#adjuster-estimation').slideDown();
            }
            else {
                $('#adjuster-estimation').slideUp();
            }
            self.update_adjusting_chart();
        },
        get_adjusting_key: function () {
            var self = this;
            if (self.adjusting_kpi.adjusting_month === 'quarter') {
                console.log('quarter')
                return 'quarter';
            }
            else {
                console.log('month_' + self.adjusting_kpi.adjusting_month)
                return 'month_' + self.adjusting_kpi.adjusting_month;
            }

        },
        // Calculate for adjusting_kpi object, calculate by month
        calculate_score_with_level: function (_result = null) {
            var self = this;
            var _month = self.adjusting_kpi.adjusting_month; // get month
            var _target = 0;
            _target = parseFloat(self.adjusting_kpi['month_' + _month + '_target']); // get target
            if (_month === 'quarter') {
                _target = parseFloat(self.adjusting_kpi['target']);
            }
            console.log(_result)
            if (_result === null) { // calculate fof default values

                _result = parseFloat(self.adjusting_kpi['month_' + _month]);
                if (_month === 'quarter') {
                    _result = parseFloat(self.adjusting_kpi['real']);

                }

            } // get result}


            var _min = 0;
            var _max = 0;
            var _max_score = parseFloat(self.organization.max_score);
            var _operator = self.adjusting_kpi.operator;

            if (_operator === '>=') {
                console.log(calculate_with_operator_greater())
                console.log(_result)
                _min = parseFloat(self.adjusting_kpi.achievement_calculation_method_extra[self.get_adjusting_key()].bottom); // get min target
                _max = parseFloat(self.adjusting_kpi.achievement_calculation_method_extra[self.get_adjusting_key()].top); // get max target
                var score = calculate_with_operator_greater();
                if (score < 0) return (0.0).toFixed(2);
                return score;

            }
            if (_operator === '<=') {
                _min = parseFloat(self.adjusting_kpi.achievement_calculation_method_extra[self.get_adjusting_key()].top); // get min target
                _max = parseFloat(self.adjusting_kpi.achievement_calculation_method_extra[self.get_adjusting_key()].bottom); // get max target
                var score = calculate_with_operator_less();
                if (score < 0) return (0.0).toFixed(2);
                return score;
            }

            function calculate_with_operator_greater() {
                var score = (0.0).toFixed(2);

                if (_result < _min) {
                    return (0.0).toFixed(2); // zero if less than min
                }
                if (_result <= _target && _result >= _min) {
                    score = ((_result / _target) * 100).toFixed(2); // follow with function in document
                    return score;
                }
                if (_result >= _target && _result < _max) {
                    score = (
                        (_result - _target) / (_max - _target) * (_max_score - 100) + 100 // follow with function in document
                    ).toFixed(2);
                    return score;
                }
                if (_result >= _max) {
                    return _max_score.toFixed(2); // max score gained if greater than max
                }
            }

            function calculate_with_operator_less() {
                var score = (0.0).toFixed(2);


                if (_result <= _min) {
                    return _max_score.toFixed(2); // max score gained if less than or equal to min
                }
                if (_result > _min && _result <= _target) {
                    score = (
                        (_result - _min) / (_target - _min) * (100 - _max_score) + _max_score // follow with function in document
                    ).toFixed(2);
                    return score;
                }
                if (_result >= _target && _result <= _max) {
                    score = (
                        (2 - _result / _target) * 100  // follow with function in document
                    ).toFixed(2);
                    return score;
                }
                if (_result > _max) {
                    return (0.0).toFixed(2); // zero if greater than max
                }
            }
        },
        fetch_chart_data: function () {
            var self = this;
            var data = [];
            if (self.adjusting_kpi.operator === '>=') {
                data = [
                    {
                        x: self.adjusting_kpi.achievement_calculation_method_extra[self.get_adjusting_key()].bottom,
                        y: self.calculate_score_with_level(self.adjusting_kpi.achievement_calculation_method_extra[self.get_adjusting_key()].bottom)
                    }, {
                        x: self.adjusting_kpi.adjusting_month === 'quarter' ? self.adjusting_kpi['target'] : self.adjusting_kpi['month_' + self.adjusting_kpi.adjusting_month + '_target'],
                        y: 100
                    }, {
                        x: self.adjusting_kpi.achievement_calculation_method_extra[self.get_adjusting_key()].top,
                        y: self.organization.max_score
                    }]
            }
            else if (self.adjusting_kpi.operator === '<=') {
                data = [
                    {
                        x: self.adjusting_kpi.achievement_calculation_method_extra[self.get_adjusting_key()].top,
                        y: self.organization.max_score

                    }, {
                        x: self.adjusting_kpi.adjusting_month === 'quarter' ? self.adjusting_kpi['target'] : self.adjusting_kpi['month_' + self.adjusting_kpi.adjusting_month + '_target'],
                        y: 100
                    }, {
                        x: self.adjusting_kpi.achievement_calculation_method_extra[self.get_adjusting_key()].bottom,
                        y: self.calculate_score_with_level(self.adjusting_kpi.achievement_calculation_method_extra[self.get_adjusting_key()].bottom)
                    }]
            }
            return data;

        },
        resetErrorWhenShow: function() {
            $('#error-input-1').css('display','none');
            $('#error-input-2').css('display','none');
            $('#error-input-3').css('display','none');
            $('#error-input-4').css('display','none');
        },
        check_number: function(e){
            var charCode = e.which || e.keyCode; //It will work in chrome and firefox.
            var _number = String.fromCharCode(charCode);
            if (e.key !== undefined && e.charCode === 0) {
                // FireFox key Del - Supr - Up - Down - Left - Right
                return;
            }
            if ('0123456789.'.indexOf(_number) !== -1) {
                return _number;
            }
            e.preventDefault();
            return false;
        },
        update_adjusting_chart: function () {
            var self = this;
            console.log('triggered')
            console.log(self.adjusting_kpi.achievement_calculation_method_extra[self.get_adjusting_key()])
            if (self.adjusting_chart === null) {
                self.init_adjusting_chart();
            }
            var data = self.fetch_chart_data();

            self.adjusting_chart.data.datasets[1].data = data; // update performance chart
            if (self.adjusting_kpi.enable_estimation) {
                self.adjusting_chart.data.datasets[0].data = [
                    {
                        x: self.estimated_result_with_threshold,
                        y: self.calculate_score_with_level(self.estimated_result_with_threshold)
                    }
                ]; // update estimated result chart
            } else { // remove if false
                self.adjusting_chart.data.datasets[0].data = [];
            }
            self.adjusting_chart.update()
        },
        init_adjusting_chart: function () {
            var self = this;
            var element_chart = $('#performance-adjusting-chart');
            var data = self.fetch_chart_data();
            var chart = new Chart(element_chart, {
                type: 'scatter',
                data: {
                    datasets: [
                        {
                            label: gettext('Esimated result'), // Estimated result chart, index = 0
                            data: [],
                            fill: true,
                            showLine: false,
                            lineTension: 0,
                            borderDashOffset: false,
                            backgroundColor: [
                                'rgba(182, 52, 52,1)'
                            ],
                            borderColor: [
                                'rgba(182, 52, 52,1)'
                            ],
                            pointHoverRadius: 5,
                            pointHoverBackgroundColor: 'red'
                        },
                        {
                            label: gettext("Performance"), // Performance chart, index = 1
                            data: data,
                            fill: true,
                            showLine: true,
                            lineTension: 0,
                            borderDashOffset: false,
                            backgroundColor: [
                                'rgba(51, 122, 183, 0.15)'
                            ],
                            borderColor: [
                                'rgba(51, 122, 183, 1.0)'
                            ],
                            pointHoverRadius: 5,
                            pointHoverBackgroundColor: 'red'
                        },
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    legend: {
                        display: false
                    },
                    scales: {
                        xAxes: [{
                            gridLines: {
                                display: false,
                                color: "rgba(51, 122, 183, 0.6)",
                            },
                            ticks: {
                                stepSize: 20,
                                beginAtZero: true,
                                display: false

                            },
                            scaleLabel: {
                                display: true,
                                labelString: gettext("Result")
                            },

                        }],
                        yAxes: [{
                            gridLines: {
                                display: false,
                                color: "rgba(51, 122, 183, 0.15)",
                            },
                            ticks: {
                                stepSize: 150,
                                beginAtZero: true,
                                display: false
                            },
                            scaleLabel: {
                                display: true,
                                labelString: gettext("Performance"),
                            }
                        }]
                    }
                }
            });
            self.adjusting_chart = chart;

        },
        confirm_adjust: function (elm) {
            var self = this;
            cloudjetRequest.ajax({
                type: 'post',
                url: '/api/kpi/services/',
                contentType: 'application/json',
                data: JSON.stringify({
                    id: self.adjusting_kpi.id,
                    achievement_calculation_method: self.adjusting_kpi.achievement_calculation_method,
                    achievement_calculation_method_extra: self.adjusting_kpi.achievement_calculation_method_extra,
                    command: 'update_kpi_threshold'
                }),
                success: function (res) {
                    var enable_edit = self.kpi_list[self.adjusting_kpi.id].enable_edit;
                    var enable_review = self.kpi_list[self.adjusting_kpi.id].enable_review;
                    var enable_delete = self.kpi_list[self.adjusting_kpi.id].enable_delete;

                    res.enable_edit = enable_edit;
                    res.enable_review = enable_review;
                    res.enable_delete = enable_delete;
                    self.$set(self.$data, 'kpi_list[' + self.adjusting_kpi.id + ']', res);
                    self.reset_adjust();


                },
                error: function (res) {
                }
            });
        },
        reset_adjust: function () {
            var self = this;
            self.adjusting_kpi = {};
            // Reset to month 1

        },
        init_adjust: function (kpi_id) {
            var self = this;
            // Clone to temp object
            self.adjusting_kpi = Object.assign({}, self.kpi_list[kpi_id]);
            // Setup adjusting month to regenerate chart

            $.extend(true, self.adjusting_kpi, {
                adjusting_month: 1,
                enable_estimation: false,
                estimated_result: 0
            })

            if (self.adjusting_kpi.achievement_calculation_method_extra === null) {

                self.$set(self.adjusting_kpi, 'achievement_calculation_method_extra', Object.assign({}, {
                    month_1: {
                        top: '',
                        bottom: ''
                    },
                    month_2: {
                        top: '',
                        bottom: ''
                    },
                    month_3: {
                        top: '',
                        bottom: ''
                    },
                    quarter: {
                        top: '',
                        bottom: ''
                    }
                }))
            } else {
                try {
                    self.adjusting_kpi.achievement_calculation_method_extra = JSON.parse(self.adjusting_kpi.achievement_calculation_method_extra);
                } catch (err) {

                }
            }

            // Default tab will be related to achievement_calculation_method
            var default_tab = 1;
            if (self.adjusting_kpi.achievement_calculation_method === 'topbottom') {
                default_tab = 2;
            }
            $('#performance-result-based .nav-pills li:nth-child(' + default_tab + ')').tab('show');
            $('#adjusting-dashboard .nav-tabs li:nth-child(' + self.adjusting_kpi.adjusting_month + ')').tab('show') // reset tab 1
            self.update_adjusting_chart();

        },
        adjust_performance_level: function (kpi_id) {
            var self = this;
            self.init_adjust(kpi_id);
            console.log(self.adjusting_kpi)
            $('#performance-level-adjust').modal();
            self.resetErrorWhenShow();
        },
        checkInput1: function (input_1,target) {
            var id = $('.row.col-sm-12.evaluate-chart').attr('id');
            if(input_1 >= target || input_1 < 0 ) {
                if( id == '<=')
                    $('#error-input-1').css('display','');
                else
                    $('#error-input-3').css('display','');
            }
            else {
                if( id == '<=')
                    $('#error-input-1').css('display','none');
                else
                    $('#error-input-3').css('display','none');
            }
        },
        check_paste: function (evt) {
            evt.preventDefault();
            evt.stopPropagation();
        },
        checkInput3: function(input_3,target) {
            var id = $('.row.col-sm-12.evaluate-chart').attr('id');
            if(input_3 <= target ) {
                if( id == '<=')
                    $('#error-input-2').css('display','');
                else
                    $('#error-input-4').css('display','');
            }
            else {
                if( id == '<=')
                    $('#error-input-2').css('display','none');
                else
                    $('#error-input-4').css('display','none');
            }
        },
        triggerClickTab: function(current_tab,e){
            var self = this
            self.$set('adjusting_kpi.adjusting_month',current_tab);
            self.update_adjusting_chart();
            self.checkConditon(e);
        },
        checkConditionInput1: function() {
            var self = this
            var current_tab = $('.row.col-sm-12.evaluate-chart').find('.tab-pane.fade.in.active');
            var target = parseFloat(current_tab.find('#input-2').val());
            var input_1 =  parseFloat(current_tab.find('#input-1').val());
            self.checkInput1(input_1,target);
            self.update_adjusting_chart()
        },
        checkConditionInput3: function() {
            var self = this
            var current_tab = $('.row.col-sm-12.evaluate-chart').find('.tab-pane.fade.in.active');
            var target = parseFloat(current_tab.find('#input-2').val());
            var input_3 = parseFloat(current_tab.find('#input-3').val());
            self.checkInput3(input_3,target);
            self.update_adjusting_chart()
        },
        checkConditon: function (e) {
            var self = this
            $('#error-input-1').css('display','none');
            $('#error-input-2').css('display','none');
            $('#error-input-3').css('display','none');
            $('#error-input-4').css('display','none');
            var id = $(e).find('a').attr('href');
            var input_1 = parseFloat($(id).find('#input-1').val());
            var target = parseFloat($(id).find('#input-2').val());
            var input_3 = parseFloat($(id).find('#input-3').val());
            self.checkInput1(input_1,target);
            self.checkInput3(input_3,target);
        },
        formatTime: function (time) {
            if (COMMON.LanguageCode == 'en'){
                return moment(time).format('YYYY-MM-DD HH:mm:ss');
            }
            return moment(time).format('HH:mm:ss DD/MM/YYYY');
        },

        get_company_performance: function (company_params) {
            if (company_params.ceo_id == null) {
                return false
            }
            var that = this
            //var ceo_id ='';
            var quarter_id = getUrlVars()['quarter_id'];
            var url = '/api/user_kpi/' + company_params.ceo_id + '/';
            if (quarter_id) {
                url += '?quarter_id=' + quarter_id;
            }
            cloudjetRequest.ajax({
                type: 'get',
                url: url,
                contentType: 'application/json',
                success: function (res) {
                    that.$set(that.company_params, 'performance', res)
                    // that.$set(that.$data, 'company_params.performance', res)
                },
                error: function (res) {
                }
            });
        },
        fetch_current_user_profile: function () {
            var that = this;
            cloudjetRequest.ajax({
                type: 'GET',
                url: '/api/v2/profile/' + that.user_id,
                success: function (res) {
                    that.$set(that.$data,  'current_user_profile', res);
                    // migration note: current_user_profile will flow down to the child
                    // https://vuejs.org/v2/guide/components-props.html#One-Way-Data-Flow
                    // that.$broadcast('fetch_user_profile_from_parent') // passed to bonus component by props
                    that.get_backups_list();

                }
            });
        },

        fetch_exscore: function () {
            var that = this;
            that.fetched_data_exscore_user = [];
            cloudjetRequest.ajax({
                type: 'GET',
                url: '/api/v2/exscore/',
                data: {
                    user_id: that.user_id,
                },
                success: function (data) {
                    var minus = [];
                    var plus = [];
                    var zero = [];
                    for(i=1;i<4;i++){
                        minus[i] = 0;
                        plus[i] = 0;

                        // Push điểm trừ
                        data[i]['minus'].forEach(function(e){
                            minus[i] -= e.employee_points;
                            e.month = i;
                            that.fetched_data_exscore_user.push(e);
                        })

                        // Push điểm cộng
                        data[i]['plus'].forEach(function(e){
                            plus[i] += e.employee_points
                            if (plus[i] >= 20){
                                plus[i]  = 20
                            }
                            e.month = i;
                            that.fetched_data_exscore_user.push(e);
                        })

                        // Push tháng có liệt
                        // Nếu có điểm liệt == điểm hiệu suất tháng đó của user
                        var zero_score = 0;
                        data[i]['zero'].forEach(function (e){
                           zero_score = parseFloat(that.employee_performance['month_'+i+'_score']);
                           e.month = i;
                           e.employee_points = -zero_score;
                           minus[i] = -zero_score ;
                           plus[i] = 0;
                           that.fetched_data_exscore_user.push(e);
                        })
                        // Tổng điểm
                        that.exscore_score[i]['score'] = plus[i] + minus[i];
                    }
                    that.exscore_score[1]['month_name'] = that.month_1_name;
                    that.exscore_score[2]['month_name'] = that.month_2_name;
                    that.exscore_score[3]['month_name'] = that.month_3_name;
                }
            });

        },
        get_weight_bygroup: function (group) {
            return this.total_weight_bygroup[group];
        },

        get_url_order_quarter: function (id) {
            if (window.location.href.search('/emp/') != -1) {
                if (id == that.current_quarter.id) {
                    return COMMON.LinkDashBoard + 'emp/' + that.user_id + '/';
                }
                return COMMON.LinkDashBoard + 'emp/' + that.user_id + '/' + '?quarter_id=' + id;
            } else {
                if (id == that.current_quarter.id) {
                    return COMMON.LinkDashBoard;
                }
                return COMMON.LinkDashBoard + '?quarter_id=' + id;
            }
        },
        get_time: function (date, format) {
            var dateParts = date.split("-");
            if (dateParts.length != 3)
                return null;
            var year = dateParts[0];
            var month = dateParts[1];
            var day = dateParts[2];
            var date_c = new Date(year, month, day);
            switch (format) {
                case 'm':
                    return gettext('Month') + ' ' + date_c.getMonth();
                    break;
                case 'd':
                    return gettext('Day') + ' ' + date_c.getDate();
                    break;
                case 'y':
                    return gettext('Year') + ' ' + date_c.getFullYear();
                    break;
                case 'dmy':
                    return gettext('Day') + ' ' + date_c.getDate() + ' ' + gettext('Month') + ' ' + date_c.getMonth() + ' ' + gettext('Year') + ' ' + date_c.getFullYear();
                    break;
                default:
                    return '';
                    break;
            }
        },
        calculate_total_weight_edit_by_group: function(category){
            var total = 0;
            var kpis = Object.values(this.parentKPIs).filter(function (kpi) {
                return kpi.bsc_category == category;
            })
            kpis.forEach(function (kpi) {
                total += parseFloat(kpi.new_weight) || 0;
            })
            return total;
        },
        calculate_total_weight: function () {
            var that = this;

            var calculate__total_current_weight= function(){
                that.total_weight_by_user = {};
                that.total_weight_bygroup = {'A': 0, 'B': 0, 'C': 0, 'O': 0, 'G': 0};
                that.total_kpis_bygroup = {'A': 0, 'B': 0, 'C': 0, 'O': 0, 'G': 0};

                var current = 0;
                Object.keys(that.parentKPIs).forEach(function (key) {
                    var kpi = that.parentKPIs[key];

                    if (that.total_weight_by_user[kpi.user] != undefined) {
                        current = parseFloat(that.total_weight_by_user[kpi.user]);
                    }

                    that.total_weight_by_user[kpi.user] = parseFloat(current) + parseFloat(kpi.weight);

                    Object.keys(that.total_weight_bygroup).forEach(function (key) {
                        if (key == kpi.group) {
                            that.total_weight_bygroup[key] += parseFloat(kpi.weight);
                            that.total_kpis_bygroup[key] += 1;
                        }
                    })

                });
            };
            var calculate__total_old_weight = function () {

                that.total_old_weight = {};
                that.total_old_weight_bygroup = {'A': 0, 'B': 0, 'C': 0, 'O': 0, 'G': 0};
                that.total_old_kpis_bygroup = {'A': 0, 'B': 0, 'C': 0, 'O': 0, 'G': 0};

                var current = 0;
                Object.keys(that.parentKPIs).forEach(function (key) {
                    var kpi = that.parentKPIs[key];

                    if (that.total_old_weight_by_user[kpi.user] != undefined) {
                        current = parseFloat(that.total_old_weight_by_user[kpi.user]);
                    }
                    that.total_old_weight_by_user[kpi.user] = parseFloat(current) + parseFloat(kpi.old_weight);

                    Object.keys(that.total_old_weight_bygroup).forEach(function (gkey) {
                        if (gkey == kpi.group) {
                            that.total_old_weight_bygroup[gkey] += parseFloat(kpi.old_weight);
                            that.total_old_kpis_bygroup[gkey] += 1;
                        }
                    });


                });
            };

            var calculate__total_current_weight_by_category = function(){

                that.total_edit_weight = {'financial':0,'financial_ratio':0,'financial_total':0,
                    'customer':0,'customer_ratio':0,'customer_total':0,
                    'internal':0,'internal_ratio':0,'internal_total':0,
                    'learninggrowth':0,'learninggrowth_ratio':0,'learninggrowth_total':0,
                    'other':0,'other_ratio':0,'other_total':0};

                Object.keys(that.parentKPIs).forEach(function (key) {
                    var kpi = that.parentKPIs[key];


                    if (kpi.bsc_category == 'financial'){
                        var weight_percent = parseFloat(kpi.weight*100/that.total_weight_by_user[kpi.user]).toFixed(1);
                        that.total_edit_weight.financial_ratio += parseFloat(weight_percent);

                        that.total_edit_weight.financial += parseFloat(kpi.weight);
                        that.total_edit_weight.financial_total += 1;

                        return;
                    }
                    else if (kpi.bsc_category == 'customer'){
                        var weight_percent = parseFloat(kpi.weight*100/that.total_weight_by_user[kpi.user]).toFixed(1);
                        that.total_edit_weight.customer_ratio += parseFloat(weight_percent);

                        that.total_edit_weight.customer += parseFloat(kpi.weight);
                        that.total_edit_weight.customer_total += 1;

                        return;
                    }
                    else if (kpi.bsc_category == 'internal'){
                        var weight_percent = parseFloat(kpi.weight*100/that.total_weight_by_user[kpi.user]).toFixed(1);
                        that.total_edit_weight.internal_ratio += parseFloat(weight_percent);

                        that.total_edit_weight.internal += parseFloat(kpi.weight);
                        that.total_edit_weight.internal_total += 1;

                        return;
                    }
                    else if (kpi.bsc_category == 'learninggrowth'){
                        var weight_percent = parseFloat(kpi.weight*100/that.total_weight_by_user[kpi.user]).toFixed(1);
                        that.total_edit_weight.learninggrowth_ratio += parseFloat(weight_percent);

                        that.total_edit_weight.learninggrowth += parseFloat(kpi.weight);
                        that.total_edit_weight.learninggrowth_total += 1;

                        return;
                    }
                    else if (kpi.bsc_category == 'other'){
                        var weight_percent = parseFloat(kpi.weight*100/that.total_weight_by_user[kpi.user]).toFixed(1);
                        that.total_edit_weight.other_ratio += parseFloat(weight_percent);

                        that.total_edit_weight.other += parseFloat(kpi.weight);
                        that.total_edit_weight.other_total += 1;

                        return;
                    }


                });
            };

            calculate__total_current_weight();
            calculate__total_current_weight_by_category ();
            calculate__total_old_weight();

        },
        // Ko xài
        // change_weight: function(kpi){
        //     var that = this;
        //     if(kpi.weight<=0){
        //         swal({
        //             type: 'error',
        //             title: gettext("Unsuccess"),
        //             text: gettext("Please deactive this KPI before you change KPI's weight to 0"),
        //             showConfirmButton: true,
        //             timer: 5000,
        //         })
        //         that.kpi_list[kpi.id].weight = that.cache_weight;
        //         return false;
        //     }
        //     this.calculate_total_weight();
        // },
        // catch_change_weight: function(kpi_id, kpi_weight){
        //     // Push kpi changed
        //     var kpis = {'kpi_id':kpi_id, 'weight':kpi_weight};
        //     var that = this;
        //     that.cache_weight = kpi_weight;
        //     that.kpi_list_cache.push(kpis);
        // },
        resume_weight: function () {
            var that = this;
            that.status_error = false;
            console.log("Triggered resume weight")
            Object.keys(that.kpi_list).forEach(function (key) {
                that.kpi_list[key].weight = that.kpi_list[key].old_weight;
            });
            that.$set(that, 'kpi_list',Object.assign({}, that.kpi_list));
        },
        update_kpi_default_real: function (kpi, show_blocking_modal) {
            var data = {};
            data['default_real'] = kpi.default_real;
            data['kpi_id'] = kpi.id;


            cloudjetRequest.ajax({
                url: COMMON.LinkKPICommand,
                type: 'post',
                data: JSON.stringify(data),
                success: function (data) {
                    $('#kpi_reload' + kpi.id).click();
                },
                error: function () {
                    alert('Update  Error');
                }
            });


        },
        // Ko xài
        // change_weight: function(kpi){
        //     var that = this;
        //     if(kpi.weight<=0){
        //
        //         swal({
        //             type: 'error',
        //             title: gettext("Unsuccessful"),
        //             text: gettext('Please deactive this KPI before you change KPI\'s weight to 0'),
        //             showConfirmButton: true,
        //             timer: 5000
        //         });
        //
        //         that.kpi_list[kpi.id].weight = that.cache_weight;
        //         return false;
        //     }
        //     this.calculate_total_weight();
        // },

        show_unique_code_modal: function (kpi_id) {
            var kpi=this.kpi_list[kpi_id];
            var that =  this;
            if (!kpi.unique_code){
                kpi.unique_code = kpi.id + "_" + slugify(kpi.name).substring(0,10);
                that.update_kpi(kpi);

            }

            this.current_kpi = kpi;

            this.unique_code_cache = kpi.unique_code;
            $('#kpi-uniquecode').modal();
        },
        // update_group_name: function (kpi) {
        //     //$('.group-header-kpi-name' + kpi.id).text(kpi.refer_group_name);
        // },
        update_kpi: function (kpi, show_blocking_modal, callback) {
            var show_blocking_modal = (typeof show_blocking_modal !== 'undefined') ? show_blocking_modal : false;

            if (show_blocking_modal) {
                //cwaitingDialog.show('{% trans 'Loading!' %}', {dialogSize: 'sm', progressType: 'warning'});
            }
            if (kpi.weight <= 0) { // in case, user inputs 0.01
                swal({
                    type: 'error',
                    title: gettext("Unsuccessful"),
                    text: gettext('Please deactive this KPI before you change KPI\'s weight to 0'),
                    showConfirmButton: true,
                    timer: 5000,
                })
                this.kpi_list[kpi.id].weight = this.cache_weight;
                return false;
            }
            //    Pace.start();
            this.calculate_total_weight();
            var that = this;
            data = {};
            data['id'] = kpi.id;
            data['name'] = kpi.name;
            data['weight'] = kpi.weight;
            data['group'] = kpi.group;
            data['bsc_category'] = kpi.bsc_category;
            data['reviewer_email'] = kpi.reviewer_email;
            data['unique_code'] = kpi.unique_code;
//                data['refer_group_name'] = kpi.name; // do not update refer_group_name here, must be processed automatically
            cloudjetRequest.ajax({
                type: "POST",
                url: COMMON.LinkKPIAPI,
                data: JSON.stringify(data),
                success: function (data) {
                    console.log("success");
                    that.get_current_employee_performance();
                    var update_kpi = Object.assign(that.kpi_list[kpi.id], data);
                    // Trigger change when kpi updated (create new update_kpi instance to trigger get group and re-render)
                    that.$set(that.kpi_list, kpi.id, JSON.parse(JSON.stringify(update_kpi)));

                    // that.getListGroupV2()
                    //$('.group-header-kpi-name' + kpi.id).text(kpi.refer_group_name);
                    if (typeof callback == "function") {
                        callback(0);
                    }
                },
                error: function (obj) {
                    if (callback) {
                        callback(1);
                    }
                }
            });
        },
        check_is_valid: function (kpi_id) {
            that = this;
            var result = true;
            var kpi_deplay = that.kpi_list[kpi_id];
            var list_kpi_update = [];
            Object.keys(that.kpi_list).forEach(function (key) {

                if (!that.isNumber(that.kpi_list[key].weight)) {
                    result = false;
                    return;
                }

            });

            return result;
        },


        update_kpis: function (kpi_id) {
            var that = this;
            that.status_error = false;
            var kpi_deplay = that.kpi_list[kpi_id];
            var list_kpi_update = [];
            Object.keys(that.kpi_list).forEach(function (key) {
                if (that.kpi_list[key].refer_to == kpi_deplay.refer_to && that.kpi_list[key].old_weight != that.kpi_list[key].weight) {
                    list_kpi_update.push(that.kpi_list[key]);
                }
            });

            var list_data = [];
            list_kpi_update.forEach(function (kpi) {
                var data = {};
                data['id'] = kpi.id;
                data['name'] = kpi.name;
                data['weight'] = kpi.weight;
                data['group'] = kpi.group;
                data['bsc_category'] = kpi.bsc_category;
                data['reviewer_email'] = kpi.reviewer_email;
                data['unique_code'] = kpi.unique_code;
                list_data.push(data);
            });
            if (list_data.length > 0) {
                cloudjetRequest.ajax({
                    url: COMMON.LinkKPIAPI,
                    data: JSON.stringify({type: 'multi', data: list_data}),
                    type: 'POST',
                    success: function (res) {
                        that.get_current_employee_performance();

                        // close modal and alter message success
                        $('#modalReason').modal('hide');
                        //update new old_weight value
                        list_kpi_update.forEach(function (item) {
                            that.kpi_list[item.id].old_weight = item.weight;
                        });

                        var t = that.kpi_list;
                        that.$set(that, 'kpi_list', '');
                        that.$set(that, 'kpi_list', t);
                        setTimeout(function () {
                            swal({
                                type: 'success',
                                title: gettext("Delay KPI success"),
                                showConfirmButton: false,
                                timer: 3000
                            })
                        }, 1000)
                    },
                    error: function (a, b, c) {
                        // co loi xay ra
                        if (a.responseJSON != undefined && a.responseJSON.length > 0) {
                            that.status_error = true;
                            that.message_error = '';
                            a.responseJSON.forEach(function (kpi) {
                                that.message_error += kpi.id + " " + kpi.name + ": " + gettext('Is error') + "<br/>";
                            });
                        }
                    }
                });
            } else {
                // close modal and alter message success
                $('#modalReason').modal('hide');
                setTimeout(function () {
                    swal({
                        type: 'success',
                        title: gettext("Delay KPI success"),
                        showConfirmButton: false,
                        timer: 3000
                    })
                }, 1000);

                // $ancestors = that.get_root_kpi_wrapper(kpi_id);
                // if ($ancestors.length > 0) {
                //     $($ancestors).reload_kpi_anchor();
                // } else {
                //     $(elm).reload_kpi_anchor();
                // }
                that._reload_kpi(kpi_id);

            }
        },
        toggle_review_kpi: function(kpi){
            // alert(kpi);
            $('.reviewing'+ kpi.id ).toggleClass('hide');
        },


        showModal_e: function (month_number, kpi_id) {
            var that = this;
            var month_name = month_number == 1 ? v.month_1_name : month_number == 2 ? v.month_2_name : month_number == 3 ? v.month_3_name : '';
            this.month_name = month_name;
            this.month = month_number;
            this.disable_upload = this.check_disable_upload_evidence(this.kpi_list[kpi_id]);
            that.$set(that.$data, 'evidence_id', kpi_id);
            cloudjetRequest.ajax({
                url: '/api/v2/kpi/' + kpi_id + '/evidence/upload/',
                type: 'get',
                data: {
                    type: "json",
                    kpi_id: kpi_id,
                    month: month_number,
                },
                success: function (response) {
                    that.$set(that.$data, 'list_evidence', response);
                },
                error: function () {
                    alert("error");
                },
            }).done(function () {
                $('#evidence-modal').modal('show');
            });

        },

        showModal_kpi_action_plan: function(){
            var that = this;
            // alert('hello guys');
            cloudjetRequest.ajax({
                url: COMMON.LinkActionPlan,
                type: 'get',
                data: {
                    type: "json",
                    // kpi_id: kpi_id,
                    // month: month_number,
                },
                success: function (response) {
                    // that.$set(that.$data, 'list_action_plan_file', response.data);
                    that.list_action_plan_file = response.data;
                    // that.$set(that.$data, 'user_action_plan_permission', response.permission);
                    that.user_action_plan_permission=response.permission;


                    // if (that.list_action_plan_file.length > 0) {
                    //     that.list_action_plan_file.forEach(function (el, index) {
                    //         cloudjetRequest.ajax({
                    //             url: '/api/v2/profile/' + el.user + '/',
                    //             type: 'get',
                    //             success: function (data) {
                    //                 var key1 = 'avatar';
                    //                 var key2 = 'actor';
                    //                 // that.$set(that.$data, 'list_action_plan_file[' + index + '].avatar', data.get_avatar);
                    //                 // that.$set(that.$data, 'list_action_plan_file[' + index + '].actor', data.display_name);
                    //                 console.log('new action plan:' + that.list_action_plan_file[index].avatar);
                    //
                    //             }
                    //         })
                    //     });
                    // }

                },
                error: function () {
                    // alert("error");
                },
            }).done(function () {
                console.log('DONE!!!!!');
                $('#kpi_action_plan-modal').modal('show');
                console.log(that.list_action_plan_file)
                console.log("shown!")
            });


            // $('#kpi_action_plan-modal').modal('show');

        },

        check_disable_upload_evidence: function (kpi) {
            if (this.month == 1 && this.organization.enable_month_1_review == true && kpi.enable_review){
                return false;
            }
            if (this.month == 2 && this.organization.enable_month_2_review == true && kpi.enable_review){
                return false;
            }
            if (this.month == 3 && this.organization.enable_month_3_review == true && kpi.enable_review){
                return false;
            }
            return true;


        },
        // moved to kpi-row component
        // check_disable_edit: function (kpi) {
        //     // Document permission edit quarter target & kpi target
        //     // https://cloudjet.atlassian.net/wiki/spaces/PM/pages/454328403
        //     var that = this;
        //     // Admin allow edit
        //     if (this.is_user_system){
        //         return true;
        //     }
        //
        //     // Disable when the organization didn't allow to edit month target
        //     if (!that.organization.allow_edit_monthly_target){
        //         return false;
        //     }
        //
        //     // Enable when the kpi allows to edit
        //     if (kpi.enable_edit) {
        //         return true;
        //     }
        //
        //     // Otherwise disabled
        //     return false
        // },


        showPreview: function (file_url) {
            if (window.location.protocol == 'https:' && file_url.match('^http://'))
                file_url = file_url.replace("http://", "https://");
            var patt1 = /\.[0-9a-z]+$/i;
            this.preview_attach_url = file_url;
            var file_ext = file_url.match(patt1);
            console.log(file_ext);

            if (['.png', '.jpg', '.bmp', '.gif', '.jpeg', '.pdf', '.odf'].indexOf(file_ext[0].toLowerCase()) < 0) {
                window.open(file_url, 'Download');
            }
            else {
                if (['.pdf', '.odf'].indexOf(file_ext[0]) >= 0) {
                    this.is_img = false;
                    this.preview_attach_url = COMMON.StaticUrl + 'ViewerJS/index.html#' + file_url;
                }
                else {
                    this.is_img = true;
                }
                this.preview_attach_modal_type='evidence';
                $('#evidence-modal').modal('hide');
                $('#preview-attach-modal').modal('show');

            }
        },


        showPreview_action_plan: function (file_url) {
            if (window.location.protocol == 'https:' && file_url.match('^http://'))
                file_url = file_url.replace("http://", "https://");
            var patt1 = /\.[0-9a-z]+$/i;
            this.preview_attach_url = file_url;
            var file_ext = file_url.match(patt1);
            console.log(file_ext);

            if (['.png', '.jpg', '.bmp', '.gif', '.jpeg', '.pdf', '.odf'].indexOf(file_ext[0]) < 0) {
                window.open(file_url, 'Download');
            }
            else {
                if (['.pdf', '.odf'].indexOf(file_ext[0]) >= 0) {
                    this.is_img = false;
                    this.preview_attach_url = COMMON.StaticUrl + 'ViewerJS/index.html#' + file_url;
                }
                else {
                    this.is_img = true;
                }
                this.preview_attach_modal_type='action_plan'
                $('#kpi_action_plan-modal').modal('hide');
                $('#preview-attach-modal').modal('show');

            }
        },
        post_kpi_action_plan:function () {
            var formData = new FormData();
            var that = this;

            formData.append('content', $("#board-upload-action-plan .action-plan-descr").val().replace("\r\n", "<br/>"));
            formData.append('attachment', $("#file-upload-action-plan-input")[0].files[0]);

            if ($("#file-upload-action-plan-input")[0].files[0]) {
                cloudjetRequest.ajax({
                    url: COMMON.LinkActionPlan,
                    type: 'post',
                    data: formData,
                    processData: false,
                    contentType: false,
                    success: function (response) {
                        console.log(response);
                        that.refresh_form_action_plan();
                        var mesage = gettext("Post action plan successfully!");
                        alert(mesage);
                        // The unshift() method adds new items to the beginning of an array, and returns the new length.
                        that.list_action_plan_file.unshift(response);
                        // that.list_action_plan_file[0].avatar = COMMON.UserAvatar;
                        that.list_action_plan_file[0].actor = COMMON.UserDisplayName;
                        // var tmp = that.evidences[that.evidence_id][that.month];
                        // that.$set(that.$data, 'evidences[' + that.evidence_id + '][' + that.month + ']', tmp + 1);
                    },
                    error: function () {
                        // alert("error");
                    }
                    }).done(function () {
                        // $('#save-evidence').attr('disabled', 'disabled');
                        // $('#file-upload-action-plan-input').val('');
                        // that.action_plan_filename = '';
                        // $("#board-upload-action-plan .action-plan-descr").val('');
                        // $('#kpi_action_plan-modal .form-start').show();
                    });
            }
            else alert(gettext('Please select a file!'));
        },
        refresh_form_action_plan: function(){
            this.action_plan_filename = '';
            $("#kpi_action_plan-modal .form-start").show();
            $("#file-upload-action-plan-form")[0].reset();
        },
        postEvidence: function () {
            var formData = new FormData();
            var that = this;
            console.log("KPI_ID POST:" + that.evidence_id);
            formData.append('content', $("#e-content").val().replace("\r\n", "<br/>"));
            formData.append('month', that.month);
            formData.append('attachment', $("#file-upload")[0].files[0]);
            if ($("#file-upload")[0].files[0]) {
                cloudjetRequest.ajax({
                    url: '/api/v2/kpi/' + that.evidence_id + '/evidence/upload/',
                    type: 'post',
                    data: formData,
                    processData: false,
                    contentType: false,
                    success: function (response) {
                        // The unshift() method adds new items to the beginning of an array, and returns the new length.
                        that.list_evidence.unshift(response);
                        that.list_evidence[0].avatar = COMMON.UserAvatar;
                        that.list_evidence[0].actor = COMMON.UserDisplayName;
                        var tmp = that.evidences[that.evidence_id][that.month];
                        that.$set(that.evidences[that.evidence_id], that.month, tmp + 1);
                        console.log(tmp);

                        if (that.evidences[that.evidence_id]==undefined){
                            that.evidences[that.evidence_id]={};
                        }
                        // that.evidences[kpi_id][month_number]=res;
                        that.evidences[that.evidence_id][that.month]=tmp + 1;
                        // that.$set(that.$data, 'evidences', that.evidences);
                        that.evidences = Object.assign({}, that.evidences)



                    },
                    error: function () {
                        alert("error");
                    }
                }).done(function () {
                    // $('#save-evidence').attr('disabled', 'disabled');
                    $('#file-upload').val('');
                    that.filename = '';
                    $('#e-content').val('');
                    $('.form-start').show();
                });
            }
            else alert(gettext('Please select a file!'));
        },
        show_Modal_delevi: function(index){
            var that = this;
            that.current_evidence = that.list_evidence[index];
            $('#evidence-modal').modal('hide');
            $('#confirm-delete-evidence').modal('show');
        },
        show_modal_delete_action_plan: function(index){
            var that = this;
            that.action_plan_to_be_deleted = that.list_action_plan_file[index];
            $('#kpi_action_plan-modal').modal('hide');
            $("#confirm-delete-action-plan-modal").modal('show');

        },


        deleteEvidence: function(id, kpi_id, month){
            var that = this;
            var current_evidence_count=that.evidences[kpi_id][month];
            cloudjetRequest.ajax({
                url: '/api/v2/kpi/' + kpi_id + '/evidence/upload/',
                type: 'delete',
                data: {
                    type: "json",
                    id: id,
                    month: month
                },
                success: function (response) {

                },
                error: function () {
                    // alert("error");
                    $("#confirm-delete-evidence").modal('hide');
                    $('#evidence-modal').modal('show');
                },
            }).done(function () {
                $("#confirm-delete-evidence").modal('hide');
                that.showModal_e(month,kpi_id);
                // that.get_evidence(month,kpi_id);
                setObj(that.evidences, kpi_id + '.' + month, current_evidence_count-1 );
                that.evidences=Object.assign({}, that.evidences);
            });
        },

        delete_action_plan: function(id){
            var that = this;
            cloudjetRequest.ajax({
                // url: '/api/v2/kpi/' + kpi_id + '/evidence/upload/',
                url: COMMON.LinkActionPlan,
                type: 'delete',
                data: {
                    type: "json",
                    id: id,
                },
                success: function (response) {

                },
                error: function () {
                    // alert("error");
                    $("#confirm-delete-action-plan-modal").modal('hide');
                    $('#kpi_action_plan-modal').modal('show');
                },
            }).done(function () {
                $("#confirm-delete-action-plan-modal").modal('hide');
                that.showModal_kpi_action_plan(); // fucking, this will be request to server again

            });
        },

        handleFile:function (e){
            $('.form-start').hide();
            var width = 1, that=this;
            var file = $('#file-upload')[0].files[0];
            var file_name = $('#file-upload')[0].files[0].name;
            this.filename = file_name;
            var allowedExtensions = /(\.jpg|\.jpeg|\.png|\.docx|\.pdf|\.xls|\.xlsx|\.doc|\.bmp)$/i;
            if(!allowedExtensions.exec(file_name)) {
                that.message_error_upload_evidence = 'Định dạng file không đúng, vui lòng thử lại!';
                return false;
            }
            else if(file.size/1024/1024 > 5){
                that.message_error_upload_evidence = 'Kích thước file > 5mb, vui lòng thử lại!';
                return false;
            }
            else{
                that.message_error_upload_evidence = null;
                var id = setInterval(frame, 10);
            }
            function frame() {
                if (width >= 100) {
                    clearInterval(id);
                    $("#ico-circle-check").css('color','#7ed321');
                    $("#myBar").hide();
                    $("#title-loading").hide();
                    $("#e-content").show();
                    $("#btn-cancel-evi").show();
                    $("#btn-save-evi").show();

                } else {
                    width++;
                    $("#percentage").text(width+'%');
                    $("#myBar").css('width', width + '%');
                }
            }
        },

        // Done
        handleFile_action_plan:function (e){
            $('#kpi_action_plan-modal .form-start').hide();
            var width = 1;
            var file = $('#file-upload-action-plan-input')[0].files[0];
            var file_name = $('#file-upload-action-plan-input')[0].files[0].name;
            this.action_plan_filename = file_name;
            var allowedExtensions = /(\.jpg|\.jpeg|\.png|\.docx|\.pdf|\.xls|\.xlsx|\.doc|\.bmp)$/i;
            if(!allowedExtensions.exec(file_name) || file.size/1024/1024 > 5) {
                that.status_upload_action_plan = false;
                return false;
            }
            else{
                that.status_upload_action_plan = true;
                var id = setInterval(frame, 10);
            }
            function frame() {
                if (width >= 100) {
                    clearInterval(id);
                    $("#board-upload-action-plan .ico-circle-check").css('color','#7ed321');
                    $("#board-upload-action-plan .file-upload-progress-bar-wrapper .file-upload-progress-bar").hide();
                    $("#board-upload-action-plan .title-loading").hide();
                    $("#board-upload-action-plan .action-plan-descr").show();
                    $("#board-upload-action-plan .btn-start-over").show();
                    $("#board-upload-action-plan .btn-save-upload").show();

                } else {
                    width++;
                    $("#board-upload-action-plan .file-upload-percentage").text(width+'%');
                    $("#board-upload-action-plan .file-upload-progress-bar-wrapper .file-upload-progress-bar").css('width', width + '%');
                }
            }
        },

        get_current_quarter: function () {
            that = this;
            cloudjetRequest.ajax({
                type: 'get',
                async: false,
                url: COMMON.LinkQuarter + '?get_current_quarter=yes',
                success: function (data) {
                    that.month_1_name = data['month_1_name'];
                    that.month_2_name = data['month_2_name'];
                    that.month_3_name = data['month_3_name'];
                    // that.$set(that.$data, 'current_quarter', data['fields']);
                    // that.$set(that.current_quarter, data['fields']);
                    that.current_quarter = Object.assign({}, that.current_quarter, data['fields'])
                    // that.$set(that.$data, this.$data, 'current_quarter', data['fields']);
                },
                error: function () {
                    alert('error');
                },
                complete: function (data) {
                    $('.add_kpi').show();
                }
            });
        },

        get_quarter_by_id: function () {
            that = this;
            var quarter_id = getUrlVars()['quarter_id'];
            if (quarter_id) {
                cloudjetRequest.ajax({
                    type: 'get',
                    url: COMMON.LinkQuarter + '?quarter_id=' + quarter_id,
                    success: function (data) {
                        that.$set(that.$data, 'quarter_by_id', data);
                        that.month_1_name = data['month_1_name'];
                        that.month_2_name = data['month_2_name'];
                        that.month_3_name = data['month_3_name'];
                    },
                    error: function () {
                        alert('error');
                    },
                    complete: function (data) {
                    }
                });
            } else {
                that.quarter_by_id = that.current_quarter;
            }
        },

        get_current_employee_performance: function () {
            this.get_employee_performance(COMMON.OrgUserId);
        },

        get_employee_performance: function (emp_id) {
            var that = this;
            var quarter_id = getUrlVars()['quarter_id'];
            var url = '/api/user_kpi/' + emp_id + '/';
            if (quarter_id) {
                url += '?quarter_id=' + quarter_id;
            }
            cloudjetRequest.ajax({
                type: 'get',
                url: url,
                success: function (res) {
                    // that.$set(that.$data,  'employee_performance', res);
                    that.employee_performance=res;
                    that.get_backups_list(true);
                    // console.log('jahskjfkjsdaasdh');
                },
                error: function (res) {
                }
            });
        },

        get_current_organization: function () {
            var that = this;
            cloudjetRequest.ajax({
                type: 'get',
                async: false,
                url: COMMON.LinkOrgAPI,
                success: function (data) {
                    that.$set(that.$data,  'organization', data);

                    console.log(that.organization)
                    that.check_status_msg_expired();
                },
                error: function () {
                    alert('error getting organization');
                },
                complete: function () {

                }
            });
        },
        update_current_organization: function () {
            that = this;
            console.log('update_current_organization');
            cloudjetRequest.ajax({
                url: COMMON.LinkOrgAPI,
                type: 'post',
                data: JSON.stringify(that.organization),
                success: function (data) {
                    that.$set(that.$data,  'organization', data);
                },
                error: function () {
                    alert('Update organization Error');
                }
            });
        },

        count_zero_score_kpi: function (recheck) {
            var user_id = COMMON.OrgUserId;

            var that = this;
            that.total_zero_score_kpis = [];
            var quarter_id = getUrlVars()['quarter_id'];
            var url = COMMON.LinkKPIParentAPI + '?user_id=' + user_id;
            url += (quarter_id != undefined) ? '&quarter_id=' + quarter_id : '';
            if (recheck == true) {
                url += "&recheck=true"
            }

            cloudjetRequest.ajax({
                url: url,
                type: 'post',
                success: function (results) {
                    results = results.filter(function (kpi){
                            return kpi.weight > 0;
                    });
//                         results = jQuery.grep(results, function(item){
//                            return (item.month_1_score ==0 || item.month_2_score ==0 || item.month_3_score==0 || item.latest_score==0)
//                         });
                    results.forEach(function (item) {
                        // var value_weight = $('.kpi-rating[data-id=' + item.id + ']').find('span.weighting_score>span').text();
                        // value_weight = parseFloat(value_weight.slice(1, -2));
                        // item.weight_percentage = value_weight;//use jquery to locate to weight percenatge in kpi-editor relative to kpi

                        // Update lai weight KPI
                        var value_weight = parseFloat(item.weight*100/that.total_weight_by_user[user_id]);
                        item.weight_percentage = value_weight;

                    })
                    that.$set(that.$data, 'total_zero_score_kpis', results);
                    if (recheck == true) {
                        location.reload();
                    }

                },
                error: function () {
                    alert('Load Kpis Error');
                }
            });

        },

        get_children: function (kpi_id) {
            // Pace.start();
            var self = this;
            cloudjetRequest.ajax({
                type: 'get',
                url: COMMON.LinkKPIAPI + '?kpi_id=' + kpi_id,
                success: function (data) {
                    $('#childrenKPIModal').modal();
                    self.$set(self.$data, 'current_kpi', data);
                    console.log(self.current_kpi)
                    self.$compile(self.$el)
                    //    that.$set(that.$data, 'children_kpis', data.children);
                },
                error: function () {
                    alert('error');
                },
                complete: function (data) {
                    $('.add_kpi').show();
                }
            });

        },
        show_copy_kpi_modal: function (kpi_id) {
            //  not used any more
            that = this;
            $('#copy-kpi-modal').modal();


        },
        copy_kpi: function (kpi_id) {
            //  not used any more
            that = this;
            cloudjetRequest.ajax({
                type: 'get',
                url: COMMON.LinkKPIAPI + '?kpi_id=' + kpi_id,
                success: function (data) {
                    that.current_kpi=Object.assign({}, data);
                    // that.$set(that.$data, 'current_kpi', data);
                    // that.$compile(that.$el);
                    //    that.$set(that.$data, 'children_kpis', data.children);
                },
                error: function () {
                    alert('error');
                },
                complete: function (data) {
                }
            });

        },
        change_category: function (kpi_id) {
            //     Pace.start();
            // alert('change_category');
            that = this;
            cloudjetRequest.ajax({
                type: 'get',
                url: COMMON.LinkKPIAPI + '?kpi_id=' + kpi_id,
                success: function (data) {
                    $('#categoryKPIModal').modal('show');
                    that.current_kpi=Object.assign({}, data);
                    // that.$set(that.$data, 'current_kpi', data);
                    // that.$compile(that.$el);
                },
                error: function () {
                    alert('error');
                },
                complete: function (data) {
                    $('.add_kpi').show();
                }
            });

        },

        change_group: function (kpi) {
            if (!kpi.enable_edit) {
                return false;
            }


            self = this;

            switch (kpi.group) {
                case "A":
                    kpi.group = "B";
                    self.kpi_list[kpi.id].group = kpi.group;
                    break;
                case "B":
                    kpi.group = "C";
                    self.kpi_list[kpi.id].group = kpi.group;
                    break;
                case "C":
                    kpi.group = "O";
                    self.kpi_list[kpi.id].group = kpi.group;
                    break;
                case "O":
                    kpi.group = "G";
                    self.kpi_list[kpi.id].group = kpi.group;
                    break;
                default:
                    kpi.group = "A";
                    self.kpi_list[kpi.id].group = kpi.group;
            }
            self.update_kpi(kpi);
        },
        set_month_target_from_last_quarter_three_months_result: function (kpi_id, user_id, kpi_unique_key, last_quarter_id) {
            // Khang build this function
            //       Pace.start(); // Monitor ajax
            var that = this;
            var review_type = that.kpi_list[kpi_id].score_calculation_type; // Get review type
            if (review_type !== "most_recent") {
                sweetAlert(gettext("ACTION FAILED"), gettext("This feature is only use for most-recent score calculate type!"), "error");
                return false;
            }
            else {
                cloudjetRequest.ajax({
                    method: "GET",
                    url: "/api/v2/user/" + user_id + "/kpis",
                    data: {
                        unique_key: kpi_unique_key,
                        quarter_period_id: last_quarter_id
                    },
                    success: function (kpi_result_list) {
                        if (kpi_result_list.length) {
                            var kpi = kpi_result_list[0];
                            var month_1 = parseFloat(kpi['month_1']);
                            var month_2 = parseFloat(kpi['month_2']);
                            var month_3 = parseFloat(kpi['month_3']);
                            var new_target = null;
                            var kpi_object = that.kpi_list[kpi_id];// Clone to new object
                            if (isNaN(month_1) && isNaN(month_2) && isNaN(month_3)) {
                                sweetAlert(gettext("ACTION FAILED"), gettext("Score can't be updated because no score were founds!"), "error");
                                return false;
                            }
                            else {
                                var sum = ((!isNaN(month_1) ? month_1 : 0) + (!isNaN(month_2) ? month_2 : 0) + (!isNaN(month_3) ? month_3 : 0));
                                var divide = ((!isNaN(month_1) ? 1 : 0) + (!isNaN(month_2) ? 1 : 0) + (!isNaN(month_3) ? 1 : 0));
                                new_target = sum / divide;
                                kpi_object['month_1_target'] = kpi_object['month_2_target'] = kpi_object['month_3_target'] = new_target;

                                that.$set(that.$data, 'kpi_list[' + kpi_id + ']', kpi_object);
                                sweetAlert(gettext("ACTION COMPLETED"), gettext("The KPI is successfully updated"), "success");
                            }
                        }
                        else {
                            sweetAlert(gettext("ACTION FAILED"), gettext("Score can't be updated because no score were founds!"), "error");
                            return false;
                        }
                    },
                    error: function (err) {
                        sweetAlert(gettext("ACTION FAILED"), gettext("System Error: ") + err, "error");

                    },
                    complete: function (data) {

                    }
                });
            }

            // Ref:https://vuejs.org/v2/api/#vm-watch
        },




        complete_review_modal: function () {
            $('#complate-review-modal').modal();
            this.count_zero_score_kpi();
            this.get_current_employee_performance();
        },

        edit_weight_modal: function (){
            var that = this;
            Object.values(this.parentKPIs).forEach(function (kpi) {
                that.$set(kpi, 'new_weight',kpi.weight);
            });
            $('#edit-all-weight-modal').modal();
        },
        show_kpi_msg: function (status) {
            if (status == 0) {
                swal({
                    type: 'success',
                    title: gettext("Successful"),
                    text: gettext("Change KPI's weight successful!"),
                    showConfirmButton: true,
                    timer: 2000,
                })
                $("#edit-all-weight-modal").modal('hide');
            } else {
                swal({
                    type: 'error',
                    title: gettext("Unsuccess"),
                    text: gettext("Change KPI's weight was unsuccessful!"),
                    showConfirmButton: true,
                    timer: 2000,
                })
            }
        },
        accept_edit_weight: function() {
            var that = this;
            var is_zero_kpi = _.filter(that.parentKPIs, function(kpi){
                return kpi.new_weight <= 0 && kpi.reason === '';
            })
            if (is_zero_kpi.length > 0){
                swal({
                        type: 'error',
                        title: gettext("Unsuccessful"),
                        text: gettext('Please deactive this KPI before you change KPI\'s weight to 0'),
                        showConfirmButton: true,
                        timer: 5000,
                    })
                return false;
            }
            Object.values(that.parentKPIs).forEach(function(kpi){
                if (kpi.weight != kpi.new_weight) {
                    kpi.weight = kpi.new_weight;
                    that.update_kpi(kpi, null, that.show_kpi_msg);
                }
            })
        },

        show_backup_kpi: function () {
            $('#kpiscore-backup-help').modal('hide');
            $('#backup-kpi-modal').modal();
            this.get_backups_list(true);
        },
        get_backups_list: function (showModal) {
            self = this;
            if (showModal) $('#lb-load-backups-list').show();
            cloudjetRequest.ajax({
                type: 'get',
                url: '/api/v2/user/backup_kpis/' + self.user_id + '/' + self.current_quarter.id,
                success: function (data) {
                    $('#lb-load-backups-list').hide();
                    if ($.isArray(data)) {
                        self.backups_list = data;
                        data.forEach(function (_data) {
                            // self.$set(self.$data, 'employee_performance.month_' + _data.month + '_backup', true);
                            self.$set(self.employee_performance, 'month_' + _data.month + '_backup', true);

                            if (self.backup_month.indexOf(_data.month) == -1) {
                                self.backup_month.push(_data.month);
                            }
                        })
                    }
                }
            })
        },
        post_backup_kpis: function () {
            var self = this;
            swal({
                title: gettext("Do you want backup this KPIs?"),
                type: "warning",
                showCancelButton: true,
                cancelButtonText: gettext("Cancel"),
                confirmButtonColor: "#DD6B55",
                confirmButtonText: gettext("Agree"),
                closeOnConfirm: true
            }, function () {
                if (!self.chosen_backup_month) alert(gettext("Please choose the month to backup KPI"));
                else {
                    var btn_create_backup_kpi = $('#btn-create-backup-kpi');
                    var oldLabel = btn_create_backup_kpi.text();

                    btn_create_backup_kpi.prop('disabled', true);
                    btn_create_backup_kpi.text(gettext("Backup is in progressing") + ' ...');
                    self.hide_message('msg-id');
                    cloudjetRequest.ajax({
                        type: 'post',
                        url: '/api/v2/user/backup_kpis/' + self.user_id + '/' + self.current_quarter.id,
                        data: JSON.stringify({month: self.chosen_backup_month}),
                        success: function (data) {
                            function findBackup(id) {
                                return $.grep(self.backups_list, function (item) {
                                    return item.id === id;
                                });
                            };
                            if (data.length > 0) {
                                data.forEach(function (item) {
                                    var _backup = findBackup(item.id);
                                    console.log(_backup);
                                    if (_backup.length > 0) {
                                        self.show_message('msg-id', gettext("KPI Backup is exist!"));
                                        setTimeout(function () {
                                            self.hide_message('msg-id');
                                        }, 3000);
                                    }
                                    else {
                                        self.backups_list.push(item);
                                        self.backup_month.push(item.month);
                                        self.$set(self.employee_performance, 'month_' + item.month + '_backup', true);
                                    }
                                })
                            }
                            ;

                            btn_create_backup_kpi.prop('disabled', false);
                            btn_create_backup_kpi.text(oldLabel);
                            self.update_month_backup_display(self.chosen_backup_month);
                        },
                        fail: (function () {
                            self.show_message('msg-id', gettext("Error"));
                            btn_create_backup_kpi.prop('disabled', false);
                            btn_create_backup_kpi.text(oldLabel);
                        }),
                        error: function (jqXHR, textStatus, errorThrown) {
                            self.show_message('msg-id', gettext("Error"));
                            btn_create_backup_kpi.prop('disabled', false);
                            btn_create_backup_kpi.text(oldLabel);
                        }
                    })
                }
            });
        },
        show_message: function (idStr, content) {
            $('#' + idStr).css('display', 'block').css('text-align', 'center').css('color', 'red');
            $('#' + idStr).html(content);
        },
        hide_message: function (idStr) {
            $('#' + idStr).css('display', 'none');
            $('#' + idStr).html('');
        },
        hide_backup_kpi_modal: function () {
            $('#view-backup-kpi-modal').modal('hide');
            $('#backup-kpi-modal').modal();
        },
        view_backup_kpis: function (id) {
            var self = this;
            $('#view-backup-kpi-modal').modal('show');
            $('#backup-kpi-modal').modal('hide');
            // find backup by id
            self.current_backup = self.backups_list[id];
            // console.log('fihihhihihc');

            if (self.current_backup && self.current_backup.hasOwnProperty('data')) {
                var kpis = self.current_backup.data;
                var total_weight = 0;
                self.current_backup.data.forEach(function(e){
                    total_weight += e.weight;
                })
                self.backup_month_name = self['month_' + self.current_backup.month + '_name']
                self.backup_kpis = kpis;
                self.backup_kpis.forEach(function(e, i){
                    self.backup_kpis[i].weight_percentage = parseFloat(e.weight/total_weight) * 100;
                })
            }
        },
        get_backup_month_score: function (index) {
            var self = this;
            var month = self.current_backup.month;
            var backup_kpis_month_score = parseFloat(self.backup_kpis[index]['month_' + month + '_score']);
            if ($.isNumeric(backup_kpis_month_score)){
                return backup_kpis_month_score.toFixed(2);
            } else {
                return null
            }
        },
        get_backup_month_name: function (month) {
            return self['month_' + month + '_name']
        },
        get_backup_month_target: function (index) {
            var self = this;
            var month = self.current_backup.month;
            var backup_kpis_month_target = parseFloat(self.backup_kpis[index]['month_' + month + '_target']);
            if ($.isNumeric(backup_kpis_month_target)) {
                return backup_kpis_month_target.toFixed(2);
            } else {
                return null
            }

        },
        get_backup_month_real: function (index) {
            var self = this;
            var month = self.current_backup.month;
            var backup_kpis_month = parseFloat(self.backup_kpis[index]['month_' + month]);
            if($.isNumeric(backup_kpis_month)){
                return backup_kpis_month.toFixed(2);
            }else {
                return null
            }

        },
        update_month_backup_display: function (month) {
            var self = this;
            if (month) {
                self.$set(self.employee_performance, 'month_' + month + '_backup', true);
            }
        },
        formatBackupKpis: function (val) {
            if (typeof val == 'number') {
                return val.toFixed(2) + "%";
            }
            return ""
        },
        delete_backup: function (index) {
            var self = this;
            swal({
                title: gettext('KPI Backup deleted can not be reversed'),
                text: gettext('You want to delete KPI Backup, are you sure?'),
                type: "warning",
                showCancelButton: true,
                cancelButtonText: gettext('Cancel'),
                confirmButtonColor: "#DD6B55",
                confirmButtonText: gettext('OK'),
                closeOnConfirm: false
            }, function () {
                var backup_kpi = self.backups_list[index];
                cloudjetRequest.ajax({
                    url: '/api/v2/user/backup_kpis/' + self.user_id + '/' + self.current_quarter.id,
                    type: 'delete',
                    data: JSON.stringify({month: backup_kpi.month}),
                    success: function (data, statusText, jqXHR) {
                        if (statusText === 'success') {
                            swal({
                                title: gettext('Successful'),
                                text: '<div style="padding: 5px;word-wrap: break-word;">' + gettext("KPI Backup deleted successful") + '</div>',
                                type: "success",
                                html: true,
                                confirmButtonText: gettext('OK'),
                            });
                            self.backups_list = self.backups_list.filter(function (item) {
                                return backup_kpi.month !== item.month;
                            });
                            self.backup_month.splice(self.backup_month.indexOf(backup_kpi.month), 1);
                            self.$set(self.employee_performance, 'month_' + backup_kpi.month + '_backup', false);
                            self.get_current_employee_performance();
                            self.get_backups_list(false);
                        }
                    }
                })
            });
        },
        normalize_group_weight: function (group, new_total_weight) {

            that = this;
            swal({
                title: gettext('Are you sure?'),
                text: gettext('This will set weighting score for all KPIs in group') + ' ' + group,
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                cancelButtonText: gettext('No'),
                confirmButtonText: gettext('Agree'),
                closeOnConfirm: false
            }, function () {
                var avg_weighting_score = parseFloat(that.new_group_total[group]) / that.total_kpis_bygroup[group];

                Object.keys(that.kpi_list).forEach(function (kpi_id) {
                    if (that.kpi_list[kpi_id].user == that.user_id
                        && that.kpi_list[kpi_id].group == group) {
                        var kpi = that.kpi_list[kpi_id];

                        kpi.weight = avg_weighting_score;
                        that.update_kpi(kpi);
                    }
                });

                swal(gettext('Successful') + "!", "", "success");
            });
        },

        sort_kpi_group: function () {
            function getSorted(selector, attrName) {
                return $($(selector).toArray().sort(function (a, b) {
                    var aVal = a.getAttribute(attrName),
                        bVal = b.getAttribute(attrName);
                    if (aVal != null) {
                        return aVal.localeCompare(bVal);
                    }
                    else {
                        return 1;
                    }

                }));
            }

            $('.kpi-row').css('margin-left', '0');
            //var $children = $(".kpi-parent-wrapper");
            //$children.detach();
            // $children = $children.sort(sort_kpi);
            var $children = getSorted('.kpi-parent-wrapper', 'data-kpi-group');
            $children.appendTo("#kpi-group-all");
            /*hack: remove unused div*/

            var elemToBeRemoved = $("#personal-kpis").siblings()[0]
            $(elemToBeRemoved).remove()
            // create_scrolltofixed()
            // update_scrolltofixed(true)
            /* scroll to fixed enabled */

        },

        compress_view: function () {

            $('#btn-back').show();
            $('#header').remove();
            $('.not-show-when-group').remove();

            $('#report-to-user-kpis').remove();
            $('#column-left').remove();
            $('.kpi-section-heading').remove();
            $('.kpi-group-heading').remove();

        },

        sort_by_group: function (obj) {
            this.compress_view();

            $('.kpi-refer-group').click();
            $('.kpi-refer-group').remove();
            $('.group-modifier').css('display', 'inline-block');
            $('#btn-add').remove();
            $('#btn-edit-weight').remove();

            this.sort_kpi_group();
            $(obj.currentTarget).removeClass("btn-cus-white").addClass("btn-cus-add");
            //$('.kpi-parent-wrapper').appendTo('#kpi-group-all');

        },

        get_order_quarter: function () {
            var that = this;
            cloudjetRequest.ajax({
                type: 'get',
                url: '/api/quarter/?all_quarters=true',
                success: function (data) {
                    var filteredQuarterList = data.filter(function(elm){
                        return elm.status != 'DELETED'
                    })
                    that.quarter_list = filteredQuarterList;
                }
            })
        },
        we_complete_review_confirm: function () {
            this.complete_review_confirm();
            vue_support.show_rate_nps()
        },

        setCookie: function (cname, cvalue) {
            var now = new Date(); // now
            // cvalue is second
            // getTime in milisecond
            var expiredDate = now.getTime() + cvalue * 1000;
            var d = new Date();
            d.setTime(d.getTime() + (30 * 24 * 60 * 60 * 1000));
            var expires = "expires=" + d.toUTCString(); // expires for cookie, we dont care it
            document.cookie = cname + "=" + expiredDate + ";" + expires + ";path=/";
        },

        getCookie: function (name) {
            var value = "; " + document.cookie;
            var parts = value.split("; " + name + "=");
            if (parts.length === 2) return parts.pop().split(";").shift();
        },

        get_manager_kpis: function (user_id, bsc_category) {
            var that = this;
            cloudjetRequest.ajax({
                type: 'get',
                url: '/performance/kpi/align-up/?user_id=' + user_id + "&bsc_category=" + bsc_category,
                success: function (res) {
                    that.manager_kpis = res;
                    console.log(res);
                },
                error: function (res) {
                }
            });
        },

        init_data_align_up_kpi: function (user_id, kpi_id, bsc_category) {
            var that = this;
            $(".btn-align-up-kpi").button("reset");
            that.get_manager_kpis(user_id, bsc_category);
            that.selected_kpi = that.kpi_list[kpi_id];
            $("#id-modal-align-kpi").modal('show');
        },



        save_align_up_kpi: function () {
            var _this = this;
            if (!_this.user_id || _this.selected_kpi.id || _this.selected_manager_kpi) {

            }

            $(".btn-align-up-kpi").button("loading");
            var data = {
                user_id: _this.user_id,
                kpi_id: _this.selected_manager_kpi,
                aligned_kpi_id: _this.selected_kpi.id
            }

            cloudjetRequest.ajax({
                type: 'post',
                url: '/performance/kpi/align-up/',
                data: data,
                success: function (res) {
                    $("#id-modal-align-kpi").modal('hide');
                    $(".btn-align-up-kpi").button("reset");
                    _this._reload_kpi(_this.selected_kpi.id);
                },
                error: function (res) {
                    $(".btn-align-up-kpi").button("reset");
                }
            });
        },

        complete_review_confirm: function () {
            var that = this;
            $('#complate-review-modal').modal('hide');
            var temp = $('#btn-complete-review').html();
            $('#btn-complete-review').html(gettext('Downloading! Please wait ... '));
            cloudjetRequest.ajax({
                type: 'post',
                url: COMMON.LinkRDisAPI + "?key=confirm-kpi-quarter" + that.quarter_by_id.id,
                data: {value: new Date()},
                success: function (res) {
                    that.$set(that.$data, 'complete_review', res['value']);
                    console.log(res['value']);
                },
                error: function (res) {
                }
            });
            cloudjetRequest.ajax({
                type: 'post',
                url: COMMON.LinkNotifyAPI,
                data: {
                    user_id: COMMON.OrgUserId,
                    notification_type: 'complete_review'
                },
                success: function (res) {
                    that.$set(that.$data, 'complete_review', res['value']);
                },
                error: function (res) {
                }
            });

            // $('<form></form>').attr('action', "{% url 'SimpleExport' org_user.id %}").appendTo('body').submit().remove();

            this.capture_and_download();
        },

        capture_and_download: function(){
            var that = this;
            var temp = $('#btn-complete-review').html();

            var wd = window.open("/performance/report/#/?user_id=" + COMMON.OrgUserId + "&quarter_id=" + that.quarter_by_id.id);

            $("#complate-review-modal").on("hidden.bs.modal", function () {
                html2canvas(document.body, {
                    onrendered: function (canvas) {
                        var a = document.createElement('a');
                        // toDataURL defaults to png, so we need to request a jpeg, then convert for file download.
                        a.href = canvas.toDataURL("image/jpeg").replace("image/jpeg", "image/octet-stream");
                        // a.download = (new Date()) + '-kpi.jpg';
                        a.download = 'KPIs ' + (new Date()) + '.jpg';
                        a.click();
                        $('#btn-complete-review').html('');
                    }

                });
            });
        },

        get_reason_delay_kpi: function () {
            that = this;
            return that.reason_kpi;
        },
        // set_elm_kpi: function (elm) {
        //     that = this;
        //     that.elm_kpi = elm;
        // },
        // get_elm_kpi: function (elm) {
        //     that = this;
        //     return that.elm_kpi;
        // },
        check_reason: function (kpi_id) {
            that = this;
            if (!that.reason_kpi.replace(/\s/g, '').length) {
                that.check_submit_reason = true;
                return;
            }
            if (that.reason_kpi.length > 500) {
                alert(gettext('Reason delay KPI does not exceed 500 characters'));
                that.reason_kpi = that.reason_kpi.substring(0, 500);
                that.check_submit_reason = false;
                return;
            }

            if (kpi_id != undefined)
                that.check_submit_reason = !that.check_is_valid(kpi_id);
            else
                that.check_submit_reason = false;
            return;
        },
        get_total_weight: function (refer_to) {
            var sum = 0;
            that = this;
            if (refer_to) {
                Object.keys(that.kpi_list).forEach(function (key) {
                    if (parseInt(that.kpi_list[key].refer_to) === refer_to) {
                        sum += parseFloat(that.kpi_list[key].weight) || 0;
                    }
                });
                console.log(sum);
                return sum;
            }
            return 1;
        },
        isNumberKey: function (evt, elm) {
            var charCode = (evt.which) ? evt.which : event.keyCode
            if (charCode >= 96 && charCode <= 105) {
                // Numpad keys
                charCode -= 48;
            }

            if (!this.isNumber(String.fromCharCode(charCode))) {
                $(elm).val('');
            }
            /*
                if (charCode > 31 && (charCode < 48 || charCode > 57)) {
                    //return false;
                    $(elm).val('');
                }*/
            //return true;
        },
        isNumber: function (o) {
            // Validate Numeric inputs
            if (!(o == '' || !isNaN(o - 0)) || o < 0) {
                // this.check_submit_reason = true;
                return false;
            }
            // chỗ này cực kỳ vớ vẩn
            // this.check_submit_reason = false;
            // this.check_reason();
            return true;
        },

        checkChild: function (kpi_id) {
            this.is_child = !this.parentKPIs[kpi_id];
        },

        average_3_month: function (employee_performance) {
            var count = 0;
            var total = 0;
            ['month_1_score', 'month_2_score', 'month_3_score'].forEach(function (key) {
                // if (key != 'current' && employee_performance[key] > 0) { # remove key since it was not neccessary
                if (employee_performance[key] > 0) {
                    total += employee_performance[key];
                    count += 1;
                }
            })

            if (count > 0) {
                return total / count;
            }
            return total;
        },

        // loadKPIs: function() {
        //
        //     var that = this;
        //     var quarter_id = getUrlVars()['quarter_id'];
        //
        //     cloudjetRequest.ajax({
        //         url: '/api/v2/user/'+this.user_id+'/kpis/',
        //         type: 'GET',
        //         data: {quarter_id: quarter_id},
        //         success: function (data) {
        //             console.log("=======>>>>--------------")
        //             console.log(data)
        //             var dictResult = {};
        //             data.forEach(function(a){
        //                 dictResult[a.id] = a;
        //             })
        //             // that.kpi_list = dictResult;
        //             // that.kpi_list = Object.assign({}, that.kpi_list, dictResult)
        //             that.$set(that.$data, 'kpi_list', dictResult);
        //             // that.parentKPIs = JSON.parse(JSON.stringify(dictResult));
        //             console.log(that.kpi_list);
        //         },
        //         error: function (a, b, c) {
        //
        //         }
        //     });
        // },

        update_evidence_event_callback: function (kpi_id, month, count){
            var that = this;
            var evidence={ };
            evidence[kpi_id]={};
            evidence[kpi_id][month]= count;

            // We don't want to reactive that.evidences here
            // because this evidence value is from component value
            // if reactive occur here, then component will be re-render, that not we want
            // that.evidences = Object.assign({}, that.evidences, evidence);
            setObj(that.evidences, kpi_id+ '.'+ month, count);


        }

    },



});

/**
 * Module for displaying "Waiting for..." dialog using Bootstrap
 *
 * @author Eugene Maslovich <ehpc@em42.ru>
 */

var waitingDialog = waitingDialog || (function ($) {
    'use strict';

    // Creating modal dialog's DOM
    var $dialog = $(
        '<div class="modal fade" data-backdrop="static" data-keyboard="false" tabindex="-1" role="dialog" aria-hidden="true" style="padding-top:15%; overflow-y:visible;">' +
        '<div class="modal-dialog modal-m">' +
        '<div class="modal-content">' +
        '<div class="modal-header"><h3 style="margin:0;"></h3></div>' +
        '<div class="modal-body">' +
        '<div class="progress progress-striped active" style="margin-bottom:0;"><div class="progress-bar" style="width: 100%"></div></div>' +
        '</div>' +
        '</div></div></div>');

    return {
        /**
         * Opens our dialog
         * @param message Custom message
         * @param options Custom options:
         *                  options.dialogSize - bootstrap postfix for dialog size, e.g. "sm", "m";
         *                  options.progressType - bootstrap postfix for progress bar type, e.g. "success", "warning".
         */
        show: function (message, options) {
            // Assigning defaults
            if (typeof options === 'undefined') {
                options = {};
            }
            if (typeof message === 'undefined') {
                message = 'Loading';
            }
            var settings = $.extend({
                dialogSize: 'm',
                progressType: '',
                onHide: null // This callback runs after the dialog was hidden
            }, options);

            // Configuring dialog
            $dialog.find('.modal-dialog').attr('class', 'modal-dialog').addClass('modal-' + settings.dialogSize);
            $dialog.find('.progress-bar').attr('class', 'progress-bar');
            if (settings.progressType) {
                $dialog.find('.progress-bar').addClass('progress-bar-' + settings.progressType);
            }
            $dialog.find('h3').text(message);
            // Adding callbacks
            if (typeof settings.onHide === 'function') {
                $dialog.off('hidden.bs.modal').on('hidden.bs.modal', function (e) {
                    settings.onHide.call($dialog);
                });
            }
            // Opening dialog
            $dialog.modal();
        },
        /**
         * Closes dialo
         */
        hide: function () {
            $dialog.modal('hide');
        }
    };

})(jQuery);



$(function () {
    $('#preview-attach-modal').on('hide.bs.modal', function () {
        if (v.$data.preview_attach_modal_type == 'action_plan'){
            $('#kpi_action_plan-modal').modal('show');
        }
        else if (v.$data.preview_attach_modal_type == 'evidence') {
            $('#evidence-modal').modal('show');
        }
        else {
            //do nothing
        }


    })
});

