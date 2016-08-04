define([
    'jQuery',
    'Underscore',
    'text!templates/Pagination/PaginationTemplate.html',
    'text!templates/DealTasks/dateList/ListHeader.html',
    'text!templates/DealTasks/dateList/dateItemTemplate.html',
    'text!templates/DealTasks/dateList/activityTemplate.html',
    'views/pagination',
    'views/DealTasks/CreateView',
    'views/DealTasks/EditView',
    'models/DealTasksModel',
    'views/Filter/filterView',
    'moment',
    'dataService'
], function ( $, _, paginationTemplate, listTemplate, dateItemTemplate, activityTemplate, pagination, CreateView, EditView, CurrentModel, FilterView, moment, dataService) {
    var TasksListView = pagination.extend({
        el           : '#content-holder',
        viewType     : 'datelist',
        CreateView   : CreateView,
        listTemplate : listTemplate,
        FilterView   : FilterView,
        contentType  : 'DealTasks',

        events: {
            'click div.dateListItem'    : 'goToEditDialog',
            'click .stageSelectType'    : 'showNewSelectType',
            'click .newSelectList li'   : 'chooseOption',
            'mousedown ._customCHeckbox': 'checked'
        },

        initialize: function (options) {
            $(document).off('click');
            this.startTime = options.startTime;
            this.collection = options.collection;

            this.filter = options.filter;
            options.contentType = this.contentType;
            this.makeRender(options);
            this.render();
        },

        goToEditDialog: function (e) {
            var id;
            var model;

            e.preventDefault();

            id = $(e.target).closest('.dateListItem').attr('data-id');
            model = new CurrentModel({validate: false});

            model.urlRoot = '/dealTasks/';
            model.fetch({
                data   : {id: id, viewType: 'form'},
                success: function (newModel) {
                    new EditView({model: newModel});
                },

                error: function () {
                    App.render({
                        type   : 'error',
                        message: 'Please refresh browser'
                    });
                }
            });
        },

        checked: function (e) {
            var $target = $(e.target).parent('label');

            var input = $target.find('input');
            var id = $target.closest('.dateListItem').attr('data-id');
            var workflow = input.val();
            var sequence = input.attr('data-sequence');
            var model = new CurrentModel({_id: id});

            e.stopPropagation();

            if (input.prop('checked')) {
                return false;
            }

            model.save({
                sequenceStart: sequence,
                workflow     : '5783b351df8b918c31af24ab',
                sequence     : -1,
                workflowStart: workflow
            }, {
                patch  : true, validate: false,
                success: function () {
                    input.prop('checked', true);
                }
            });

        },

        showNewSelectType: function (e) {
            var targetElement;

            if ($('.newSelectList').is(':visible')) {
                this.hideNewSelect();
            } else {
                targetElement = $(e.target).parents('td');
                targetElement.find('.newSelectList').show();
            }

            return false;
        },

        showMoreContent: function () {
           this.render();
        },

        render: function () {
            var collection = this.collection.toJSON()[0];
            var key;
            var self = this;

            $('.ui-dialog ').remove();

            this.$el.html(_.template(listTemplate));

            dataService.getData('dealTasks/getActivity', {filter : this.filter}, function(response){
                self.$el.find('#activityHolder').html(_.template(activityTemplate, {response : response.data})) ;
            });

            for (key in collection) {
                this.$el.find('#dateList').append(_.template(dateItemTemplate, {
                    moment: moment,
                    data  : collection[key],
                    type  : key
                }));
            }
        }

    });

    return TasksListView;
});
