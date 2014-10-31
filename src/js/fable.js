'use strict';

angular.module('fable', [])
    .directive('fable', function () {
        return {
            restrict: 'A',
            controller: ['$scope', '$filter', function ($scope, $filter) {
                var collection;
                var visible;

                $scope.fblInit = function (xs, root) {
                    var collection = xs;
                    var visible = collection.slice();

                    $scope.fblRoot = root(0);
                    $scope.fblItems = visible;
                    $scope.fblFilters = {};
                };

                $scope.fblReSort = function (predicate, reverse) {
                    visible = $filter('orderBy')(visible, predicate, reverse);
                };

                $scope.fblReView = function (filters) {
                    visible = collection.slice();
                    visible = $filter('filter')(visible, filters);
                };
            }],
            link: function (scope, element, attrs) {
                var fblBootstrapper = scope.$watch(attrs.fable, function (xs) {
                    if (xs) {
                        fblBootstrapper();
                        scope.fblInit(xs, element);
                    }
                });
            }
        };
    })
    .directive('fblSort', function () {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                element.bind('click', function () {
                    var reverse = false;

                    var sortingCls = 'fbl-sorting';
                    var reverseCls = 'fbl-sorting-reverse';

                    var existingSort = scope.fblRoot.querySelector(sortingCls);
                    if (existingSort) {
                        var className = existingSort.className;

                        if (existingSort !== element.get(0)) {
                            var newClassName = className
                                .replace(reverseCls, "")
                                .replace(sortingCls, "");

                            existingSort.className = newClassName;
                        } else {
                            if (className.search(reverseCls) < 0) {
                                existingSort.className = className + " " +
                                    reverseCls;

                                reverse = true;
                            } else {
                                existingSort.className = className
                                    .replace(reverseCls, "");
                            }
                        }
                    }

                    element.className = element.className + " " + sortingCls;
                    scope.fblReSort(attrs.fblSort, reverse);
                })
            }
        };
    })
    .directive('fblFilter', function () {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                var observer = new MutationObserver(function () {
                    var prop = attrs.fblFilter;
                    var val = element.value || scope.$eval(attrs.fblFilterVal);

                    scope.fblFilters[prop] = val;
                    scope.fblReView();
                });

                observer.observe(element(0), {
                    attributes: true,
                    childList: true
                });

                scope.$on('$destroy', function () {
                    observer.disconnect();
                });
            }
        };
    });