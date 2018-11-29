/**
 * Created by fountainhead on 3/9/16.
 */


const KPI_LOADING_DELAY = 1000;

function on_quarter_start_change(container) {
    if (KPI_EDITOR.kpi_search) return;
    // return;
    var _container = container;
    //return false;
    //reorder quarters header
    var quarter_circle = ['1', '2', '3', '4'];
    var part_to_move = quarter_circle.splice(0, quarter_circle.indexOf(String(KPI_EDITOR.quarter_start)));
    quarter_circle = quarter_circle.concat(part_to_move);

    if (!_container) {
        // reorder quarters target
        //http://www.w3schools.com/jsref/jsref_forEach.asp
        quarter_circle.forEach(function (item, index) {
            $('#years-target-header').append($('#q' + item + '-header'));
        });

        _container = $('.kpi-table');
    }

    $(_container).find('.kpi-target>.target-table').each(function () {
        var that = this;
        quarter_circle.forEach(function (item, index) {
            $(that).append($(that).children('[data-order=' + item + ']'));
        });

    });
}


////// note used any more
//function get_employee_performance(emp_id) {
//    $.ajax({
//        type: 'get',
//        url: '/api/user_kpi/' + emp_id + '/',
//        success: function (res) {
//            $('#employee_performance').html(res['kpi_percent']);
//            $('#team_performance').html(res['team_avg_kpi_percent']);
//            $('#emp_thumb').attr('src', res.profile['get_avatar']);
//            $('#emp_name').html(res.profile['display_name']);
//            $('#emp_title').html(res.profile['title']);
//            $('#emp_self_review_link').attr('href', res.profile['get_kpi_url']);
//            $('#emp_team_review_link').attr('href', res.profile['get_subordinate_kpi_url']);
//        },
//        error: function (res) {
//        }
//    });
//}
function enable_tooltip(container) {
    //foreach row
    $(container).find('.kpi-row').addBack('.kpi-row').each(function () {
        //for each cell in the row
        $(this).find('.cell-content').each(function () {
            $(this).qtip({
                overwrite: false,
                metadata: {
                    type: 'html5',
                    name: 'qtipopts'
                },
                /*
                 content:{
                 attr:'title'
                 },
                 */
                content: $(this).children('.tooltiptext').length > 0 ? $(this).children('.tooltiptext') : {attr: 'title'},
                style: {classes: 'qtip-green'},
                show: {
                    target: $(this).children('.tooltiptext').length > 0 ? $($(this).closest('.kpi-row').find('.kpi-id')).add(this) : false, //$(this).find('.kpi-operator .cell-content, .kpi-unit .cell-content')
                },
                /*
                 hide: {
                 //	        	        target: $(this).closest('.kpi-row').find('.kpi-id')
                 target: $($(this).closest('.kpi-row').find('.kpi-id')).add(this)
                 },
                 */
                hide: {
                    target: $(this).children('.tooltiptext').length > 0 ? $($(this).closest('.kpi-row').find('.kpi-id')).add(this) : false,
                    fixed: true,
                    delay: 300
                }
            });
        });
    });
    $(container).find('.dropdown-menu').each(function () {
        $(this).qtip({
            overwrite: false,
            metadata: {
                type: 'html5',
                name: 'qtipopts'
            },
            content: {
                attr: 'title'
            },
            style: {classes: 'qtip-green'},
            hide: {
                fixed: true,
                delay: 300
            }
        });
    });
    $(container).find('.kpi-rating label[data-toggle=tooltip], .kpiprogressreview-wrapper').tooltip({
        container: 'body',
        html: true
    });
}

function load_kpi_anchor__(anchor, delay, force_load, dont_load_in_failed, not_follow_page) {
    if (!delay) {
        delay = 0;
    }
    var obj = anchor;
    var that = obj;
    var kpi_id = $(that).attr('data-kpi-id');

    if ((!$(obj).data('loaded') && !$(obj).data('loading')) || force_load) {
        var load_params = {
            follow_page: !not_follow_page ? 1 : 0,
            load_child: 1,
            reload: 1,
            level: 1,
            has_child_loaded: 1
        }
        load_params = $.extend({}, KPI_EDITOR.load_params_default, load_params);

        clearTimeout($(obj).data('timeout_id'));
        $(obj).data('timeout_id', setTimeout(function () {

            if (!$(that).data('load_count')) {
                $(that).data('load_count', 1);
            } else {
                $(that).data('load_count', $(that).data('load_count') + 1);
            }
            console.log('load count: ' + $(that).data('load_count'));

            $(that).data('loading', true).removeClass('failed').addClass('loading');

            var kpi_id = $(that).attr('data-kpi-id');
            console.log('loaded kpis: ' + kpi_id);

            var LOAD_URL = '/performance/kpi-editor/kpi/' + kpi_id + "/?target_org=" + KPI_EDITOR.target_org_id; //FUCK THIS ?target_org={{ target_organization.id }}{% if public_view %}&public_view=1{% endif %}",
            //+'&public_view='+KPI_EDITOR.public_view
            if (KPI_EDITOR.public_view != '') {
                LOAD_URL += '&public_view=1';
            }
            if (KPI_EDITOR.kpi_search) {
                LOAD_URL += '&kpi_search=1';
            }
            // if (!not_follow_page){
            //     LOAD_URL+='&follow_page=1';
            // }

            $cloudjetRequest.ajax({
                url: LOAD_URL,
                type: 'get',
                data: load_params,
                success: function (data) {
                    $(that).data('loaded', true);
                    $(that).children('.kpi-anchor-content').html(data);

                    if (!not_follow_page) {
                        $(that).data('child_loaded', false);
                    } else {
                        $(that).data('child_loaded', true);
                    }
                    $(that).removeClass('loading failed');

                    // if (typeof (is_row_in_view)=='function' && !is_row_in_view(that)) {
                    //     $(that).children().hide();
                    // }else{
                    //     $(that).removeClass('loading failed');
                    // }


                },
                error: function () {
                    $(that).data('loading', false).removeClass('loading').addClass('failed');
                    if (!dont_load_in_failed) {
                        var mark_not_follow_page = false;
                        if (not_follow_page) {
                            mark_not_follow_page = true;
                        }
                        load_kpi_anchor(that, 10000, true, true, mark_not_follow_page);// if failed again, not auto reload
                    }


                }
            });


        }, delay));

    } else {
        console.log('already loaded!');
    }
}

function load_kpi_anchor(anchor, delay, force_load, dont_load_in_failed, not_follow_page, not_self_load) {
    if (!delay) {
        delay = KPI_LOADING_DELAY;
    }
    var obj = anchor;
    var that = obj;
    var kpi_id = $(that).attr('data-kpi-id');

    var parent_wrapper = anchor;

    // travel up to count how many level (based on  .kpi-parent-wrapper)
    var level = 1;
    if ($(parent_wrapper).is('.kpi-parent-wrapper .kpi-parent-wrapper .kpi-parent-wrapper')) {
        level = 3;//actual level >= 3
    }
    else if ($(parent_wrapper).is('.kpi-parent-wrapper .kpi-parent-wrapper')) {
        level = 2;
    } else {
        level = 1;
    }

    var has_child_loaded = 0;
    if ($(parent_wrapper).children('.kpi-child-container').children('.kpi-parent-wrapper').length) {
        has_child_loaded = 1;
    } else {
        has_child_loaded = 0;
    }


    if ((!$(obj).data('loaded') && !$(obj).data('loading')) || force_load) {
        var load_params = {
            follow_page: !not_follow_page ? 1 : 0,
            load_child: 1,
            reload: !not_self_load ? 1 : 0,
            level: level,
            has_child_loaded: has_child_loaded,
            //kpi_wrapper: not_self_load?1:0
        };
        load_params = $.extend({}, KPI_EDITOR.load_params_default, load_params);
        clearTimeout($(obj).data('timeout_id'));
        $(obj).data('timeout_id', setTimeout(function () {

            if (!$(that).data('load_count')) {
                $(that).data('load_count', 1);
            } else {
                $(that).data('load_count', $(that).data('load_count') + 1);
            }
            console.log('load count: ' + $(that).data('load_count'));

            $(that).data('loading', true).removeClass('failed').addClass('loading');

            var kpi_id = $(that).attr('data-kpi-id');
            console.log('loaded kpis: ' + kpi_id);

            var LOAD_URL = '/performance/kpi-editor/kpi/' + kpi_id + "/?target_org=" + KPI_EDITOR.target_org_id; //FUCK THIS ?target_org={{ target_organization.id }}{% if public_view %}&public_view=1{% endif %}",
            //+'&public_view='+KPI_EDITOR.public_view
            if (KPI_EDITOR.public_view != '') {
                LOAD_URL += '&public_view=1';
            }
            if (KPI_EDITOR.kpi_search) {
                LOAD_URL += '&kpi_search=1';
            }
            // if (!not_follow_page){
            //     LOAD_URL+='&follow_page=1';
            // }

            cloudjetRequest.ajax({
                url: LOAD_URL,
                type: 'get',
                data: load_params,
                success: function (data) {
                    $(that).data('loaded', true);
                    // $(that).children('.kpi-anchor-content').html(data);

                    if (load_params.reload == 1) {

                        // $(that).html(data);
                        var kpi_inline_heading = $(that).children('.kpi-refer-group');
                        $(that).html(data);
                        if ($(that).children('.kpi-refer-group').length == 0) {
                            $(that).prepend(kpi_inline_heading);
                        }

                    } else {
                        // $(that).children('.kpi-parent-wrapper').remove();
                        // $(that).append(data);
                        $(that).children('.kpi-child-container').replaceWith(data)
                    }

                    // v.$compile(v.$el);
                    // v.$compile($(that).get(0));

                    normalize_style_btn_toggle_kpi(that);

                    if (!not_follow_page) {
                        $(that).data('child_loaded', false);
                    } else {
                        $(that).data('child_loaded', true);
                    }
                    $(that).removeClass('loading failed');

                    // if (typeof (is_row_in_view)=='function' && !is_row_in_view(that)) {
                    //     $(that).children().hide();
                    // }else{
                    //     $(that).removeClass('loading failed');
                    // }

                },
                error: function () {
                    $(that).data('loading', false).removeClass('loading').addClass('failed');
                    if (!dont_load_in_failed) {
                        var mark_not_follow_page = false;
                        if (not_follow_page) {
                            mark_not_follow_page = true;
                        }
                        load_kpi_anchor(that, 10000, true, true, mark_not_follow_page);// if failed again, not auto reload
                    }


                }
            });


        }, delay));

    } else {
        console.log('already loaded!');
    }
}


var load_team_comment_count_id = null;
function load_team_comment_count_on_ready() {
    load_team_comment_count_id = setInterval(function () {
        if (($('#report-to-user-kpis .kpi-anchor:has(.kpi-parent-wrapper)').length >= $('#report-to-user-kpis .kpi-anchor').length)) {
            clearInterval(load_team_comment_count_id);
            console.log('load comment counting');
            load_comment_counter('#report-to-user-kpis');
        }
    }, 1000);

}

var load_personal_comment_count_id = null;
function load_personal_comment_count_on_ready() {
    load_personal_comment_count_id = setInterval(function () {
        if (($('#personal-kpis .kpi-anchor:has(.kpi-parent-wrapper)').length >= $('#personal-kpis .kpi-anchor').length)) {
            clearInterval(load_personal_comment_count_id);
            console.log('load comment counting');
            load_comment_counter('#personal-kpis');
        }
    }, 1000);

}

function load_comment_counter(container) {

    kpi_ids = $(container).find("input[name='kpi_id']").serialize();
    if (kpi_ids) {
        kpi_ids += '&count_comments=1';
    }
    $(container).find('a i.glyphicon-comment span.badge').hide();

    if (kpi_ids) {
        //$.post("{{ request.path }}", kpi_ids, function (res) {
        $.post("", kpi_ids, function (res) {
//                    ;
            if (typeof res == 'object') {
                for (i in res) {
                    if (res[i].count_comments > 0) {
                        $(container).find(".kpi-row.kpi-" + res[i].id + " a i.glyphicon-comment span.badge").html(res[i].count_comments).show();
                    }
                }
            } else {
                alert(res);
            }
        }).fail(function () {
            console.log("Count comments failed.");
        });
    }

}

function load_in_kpi_anchors__(container, offset_start) {
    console.log('load_in_kpi_anchors');
    if (!container) {
        container = $(document);
    }
    var kpi_anchor_arr = $(container).find('.kpi-anchor').toArray();
    var sorted_kpi_anchor_arr = kpi_anchor_arr;

    if (offset_start && kpi_anchor_arr.length > offset_start) {
        var frag1 = kpi_anchor_arr.slice(offset_start);
        var frag2 = kpi_anchor_arr.slice(0, offset_start);
        sorted_kpi_anchor_arr = frag1.concat(frag2);
    }

    $.each(sorted_kpi_anchor_arr, function (i, obj) {
        //var delay = 350 * i;
        var delay = KPI_LOADING_DELAY * i;
///        load_kpi_anchor(obj, delay, false);
    });

}
function load_in_kpi_anchors(container, offset_start) {
    console.log('load_in_kpi_anchors');
    if (!container) {
        container = $(document);
    }
    var kpi_anchor_arr = $(container).find('.kpi-group-category>.kpi-parent-wrapper').toArray();
    var sorted_kpi_anchor_arr = kpi_anchor_arr;

    // if(offset_start && kpi_anchor_arr.length > offset_start){
    //     var frag1=kpi_anchor_arr.slice(offset_start);
    //     var frag2=kpi_anchor_arr.slice(0, offset_start);
    //     sorted_kpi_anchor_arr=frag1.concat(frag2);
    // }

    $.each(sorted_kpi_anchor_arr, function (i, obj) {
       // var delay = 150 * i;
        var delay = KPI_LOADING_DELAY * i;
 ///       load_kpi_anchor(obj, delay, false); //<--- not_self_load is not set -->  problem
        //load_kpi_anchor(anchor= obj, delay=delay, force_load= false, not_self_load = 0); <-- not set all variable problems
        // load_kpi_anchor(anchor= obj, delay=delay, force_load= false, dont_load_in_failed=0, not_follow_page=0, not_self_load = 1 );
    });

}


function toggle_kpi_section($theCollapseBtn, not_animate, target_state) {
    var theBtn = $($theCollapseBtn);
    var btn_id = theBtn.prop('id');
    var to_state = 'collapse';//['collapse', 'expanse']
    var section = '';
    var animate_elm = $(theBtn).closest('.kpi-section').children('.body');
    if (!target_state) {
        if ($(animate_elm).is(':hidden')) {
            $(theBtn).children('i.fa').removeClass("fa-caret-right").addClass("fa-caret-down");
            to_state = 'expanse';
            $(animate_elm).slideDown(not_animate ? 0 : 100, function () {
            });
        } else {
            $(theBtn).children('i.fa').removeClass("fa-caret-down").addClass("fa-caret-right");
            to_state = 'collapse';
            $(animate_elm).slideUp(not_animate ? 0 : 100, function () {
            });
        }

    } else {
        if (target_state == 'expanse') {
            $(theBtn).children('i.fa').removeClass("fa-caret-right").addClass("fa-caret-down");
            to_state = 'expanse';
            $(animate_elm).slideDown(not_animate ? 0 : 100, function () {
            });
        } else {
            $(theBtn).children('i.fa').removeClass("fa-caret-down").addClass("fa-caret-right");
            to_state = 'collapse';
            $(animate_elm).slideUp(not_animate ? 0 : 100, function () {
            });
        }
    }


    //save state
    if (btn_id == 'btn-kpi-team-section-toggle') {
        section = 'team';
        setCookie('kpi-team-section-collapse', to_state, 7);
    } else {//btn-kpi-personal-section-toggle
        section = 'personal';
        setCookie('kpi-personal-section-collapse', to_state, 7);
    }


    if (to_state == 'expanse' && btn_id == 'btn-kpi-team-section-toggle' && !is_kpi_team_section_load) {
        is_kpi_team_section_load = true;
//            load_in_kpi_anchors('#report-to-user-kpis');
        load_in_kpi_anchors();
//            load_comment_count_on_ready();
        load_team_comment_count_on_ready();
    }
//        if (to_state == 'expanse' && btn_id == 'btn-kpi-personal-section-toggle' && !is_kpi_personal_section_load) {
//            is_kpi_team_section_load = true;
//            load_in_kpi_anchors('#personal-kpis');
//        }

}

function init_filtertable() {
    $('.kpi-table').filterTable({
        inputSelector: '#input-filter',
        minRows: 0,
        autofocus: false,
        callback: function (q, table, show_elms) {
            if (q !== '') {
                $(show_elms).each(function () {
                    $parent_wrappers = $(this).parentsUntil(".kpi-anchor", ".kpi-parent-wrapper");
                    for (var i = 1; i <= $parent_wrappers.length; i++) {
                        $($parent_wrappers[i]).children('.kpi-row').show();
                    }
                });
                $('.btn-kpi-toggle').attr('disabled', true);
            } else {
                $('.btn-kpi-toggle').attr('disabled', false);
            }
            $('.btn-kpi-toggle').children('i.fa').removeClass("fa-angle-double-right").addClass("fa-angle-double-down");

            $(".kpi-parent-wrapper").show();
        }
    });
}


var prevTop = 0;
//    $(document).scroll( function(evt) {
//        var currentTop = $(this).scrollTop();
//        if(prevTop !== currentTop) {
//            prevTop = currentTop;
//            console.log("I scrolled vertically.");
//        }
//    });
function init_scroll_event() {
    return; //disable load on scroll
    $(document).scroll(function () {
        // return;//disable load on scroll
        // //console.log('document scroll');
        var currentTop = $(this).scrollTop();
        if (prevTop !== currentTop) {
            prevTop = currentTop;
            console.log("I scrolled vertically.");
            update_scrolltofixed();
            var start_anchor = null;
            $('.kpi-anchor').each(function (index) {
                if (typeof (is_row_in_view) == 'function' && is_row_in_view(this)) {
                    if (!start_anchor) {
                        start_anchor = index;
                    }
                    $(this).children().show();
                    if ($(this).data('loaded') == true) {
                        $(this).removeClass('loading');
                    }
                    console.log('show row');
                    update_scrolltofixed();
                }
            });

            clearTimeout($.data(document, 'scrollTimer'));
            $.data(document, 'scrollTimer', setTimeout(function () {
                // do something
                console.log("Haven't scrolled in 300ms!");
                // call load kpi function
                if (is_kpi_team_section_load) {
                    load_in_kpi_anchors(document, start_anchor);
                } else {
                    load_in_kpi_anchors('#personal-kpis', start_anchor);
                }
            }, 500));

        }


    });
}


function init_toggle_kpi() {
    $(document).on('click', '.btn-kpi-toggle', function () {
        var theBtn = this;
        var animate_elm = $(this).closest('.kpi-parent-wrapper').children('.kpi-child-container');
        var parent_wrapper = $(this).closest('.kpi-parent-wrapper');
        console.log("enimate_elm:", animate_elm);

        if ($(animate_elm).length && $(animate_elm).children('.kpi-parent-wrapper').length) {
            $(this).prop('disabled', true);
            if ($(animate_elm).is(':hidden')) {
                $(theBtn).children('i.fa').removeClass("fa-angle-double-right").addClass("fa-angle-double-down");
            } else {
                $(theBtn).children('i.fa').removeClass("fa-angle-double-down").addClass("fa-angle-double-right");

            }
            $(animate_elm).slideToggle('fast', function () {
                $(theBtn).prop('disabled', false);
            });
        } else {
            var not_self_load = true;
            $(this).reload_kpi_anchor(not_self_load);
        }


    });

}

function normalize_style_btn_toggle_kpi(container) {
    var _container = container;
    if (!container) {
        _container = $('.kpi-table');
    }

    $(_container).find('.btn-kpi-toggle').each(function () {
        var theBtn = this;
        var animate_elm = $(this).closest('.kpi-parent-wrapper').children('.kpi-child-container');
        var parent_wrapper = $(this).closest('.kpi-parent-wrapper');

        if ($(animate_elm).length && $(animate_elm).children('.kpi-parent-wrapper').length) {
            if ($(animate_elm).is(':hidden')) {
                $(theBtn).children('i.fa').removeClass("fa-angle-double-down").addClass("fa-angle-double-right");

            } else {
                $(theBtn).children('i.fa').removeClass("fa-angle-double-right").addClass("fa-angle-double-down");

            }
        } else {
            $(theBtn).children('i.fa').removeClass("fa-angle-double-down").addClass("fa-angle-double-right");
        }
    });
}

function setup_kpi_navigation() {
    $('#content-nav').on('click',
        '[data-href=\'#tab-financial\'],' +
        ' [data-href=\'#tab-customer\'], ' +
        '[data-href=\'#tab-internal\'], ' +
        '[data-href=\'#tab-learninggrowth\'],' +
        ' [data-href=\'#tab-other\']',
        function () {
            //alert('click');
            var ref = $(this).attr('data-href').substr(5);
            var to_group = $("#personal-kpis").find('[data-kpi-group=\'' + ref + '\']').first();
            var to_kpi_section = $("#personal-kpis");

            if ($(to_kpi_section).children('div.body').is(':hidden')) {
                toggle_kpi_section($(to_kpi_section).find('button.btn-kpi-section-toggle'), true);
                $('html, body').animate({
                    scrollTop: $(to_group).offset().top
                    - $('#toolbar').outerHeight()
                    - $('#content-nav-wrapper').outerHeight()
                    - $('#kpi-row-heading').outerHeight()
                }, 300);

            } else {
                $('html, body').animate({
                    scrollTop: $(to_group).offset().top
                    - $('#toolbar').outerHeight()
                    - $('#content-nav-wrapper').outerHeight()
                    - $('#kpi-row-heading').outerHeight()
                }, 300);
            }

        });

    $('.kpi-section').on('click',
        '[data-kpi-group="financial"] .kpi-group-heading-link,' +
        '[data-kpi-group="customer"] .kpi-group-heading-link,' +
        '[data-kpi-group="internal"] .kpi-group-heading-link,' +
        '[data-kpi-group="learninggrowth"] .kpi-group-heading-link,' +
        '[data-kpi-group="other"] .kpi-group-heading-link',
        function () {
            //alert('click');
            var ref = $(this).closest('[data-kpi-group]').attr('data-kpi-group');
            var to_kpi_section;
            if ($(this).closest('.kpi-section').is('#report-to-user-kpis')) {
                to_kpi_section = '#personal-kpis';
            } else {
                to_kpi_section = '#report-to-user-kpis';
            }
            var to_group = $(to_kpi_section).find('[data-kpi-group=\'' + ref + '\']').first();
            if (to_group.length) {
                if ($(to_kpi_section).children('div.body').is(':hidden')) {
                    toggle_kpi_section($(to_kpi_section).find('button.btn-kpi-section-toggle'), true);
                    $('html, body').animate({
                        scrollTop: $(to_group).offset().top
                        - $('#toolbar').outerHeight()
                        - $('#content-nav-wrapper').outerHeight()
                        - $('#kpi-row-heading').outerHeight()
                    }, 300);

                } else {
                    $('html, body').animate({
                        scrollTop: $(to_group).offset().top
                        - $('#toolbar').outerHeight()
                        - $('#content-nav-wrapper').outerHeight()
                        - $('#kpi-row-heading').outerHeight()
                    }, 300);
                }
            }
        });
}