define([
    'base/directives/elastic'
], function() {
    // common, muce
    // report, mq
    function muceInclude($http, $templateCache, $compile) {
        // behavior like ngInclude but without create a new scope
        return function(scope, element, attrs) {
            var templatePath = attrs.muceInclude;
            $http.get(templatePath, {
                cache: $templateCache
            }).success(function(response) {
                var contents = element.html(response).contents();
                $compile(contents)(scope);
            });
        };
    }

    function disableAnimate($animate) {
        return function($scope, $element) {
            $animate.enabled(false, $element);
        }
    }

    function dateTimePickerLinker($scope, $elem, $attr, ngModelCtrl) {
        if (!$.fn.datetimepicker) return;
        ngModelCtrl.$formatters.unshift(function(valueFromModel) {
            // return how data will be shown in input
            if (!valueFromModel) return;
            return new Date(valueFromModel).dateFormat('Y-m-d');
        });

        ngModelCtrl.$parsers.push(function(valueFromInput) {
            // return how data should be stored in model
            return new Date(valueFromInput).getTime();
        });

        var diyOptions;
        $scope.$watch('picker', function(val) {
            if (!val) return;
            $elem.data('xdsoft_datetimepicker').setOptions(val);
            $elem.val($elem.data('xdsoft_datetimepicker').data('xdsoft_datetime').str());
        }, true);

        var options = _.extend({
            // lang: 'zh', with i18n{zh: months, dayOfWeek}
            format: 'Y-m-d',
            defaultSelect: false,
            scrollInput: true,
            timepicker: false,
            yearStart: 2010,
            yearEnd: 2016
        }, {
            onChangeDateTime: function(dp, $input) {
                if (diyOptions && diyOptions.onChangeDateTime) {
                    diyOptions.onChangeDateTime.call(this, dp);
                }
                ngModelCtrl.$setViewValue($input.val());
            }
        });
        $elem.datetimepicker(options);
    }

    function navbarDef($modal) {
        return function(scope, elem, attr) {
            // filter events, metrics for navbar
            scope.navs = ['report', 'mq', 'feedback'];

            scope.loginIt = function() {
                $modal.open({
                    templateUrl: 'templates/login.html',
                    controller: function($scope) {

                        $scope.doLogin = function() {
                            console.log($scope);
                            $scope.isLoginError = true;
                        }
                        console.log($scope);
                    },
                    size: 'sm'
                });
            }
        }
    }

    function multiChooser() {
        return {
            templateUrl: 'templates/widgets/multi-chooser.html',
            replace: true,
            scope: {
                choicesList: '=',
                triggerDel: '&'
            },
            link: function($scope, $elem, $attr) {
                $scope.trash = $attr.triggerDel || false;
                $scope.cancelAllSelected = function() {
                    _.each($scope.choicesList, function(item) {
                        item.selected = false;
                    });
                };
            }
        }
    }

    angular.module('muceApp.base.directives', ['muceApp.base.directives.elastic'])
        .directive('muceNavbar', navbarDef)
        .directive('muceInclude', muceInclude)
        .directive('dateTimePicker', function() {
            return {
                require: '?ngModel',
                scope: {
                    picker: '='
                },
                link: dateTimePickerLinker
            };
        })
        .directive('multiChooser', multiChooser)
        .directive('disableAnimate', disableAnimate);
});