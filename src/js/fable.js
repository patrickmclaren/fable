(function () {
    'use strict';

    angular.module('fable', [])
        .directive('fable', function () {
            return {
                restrict: 'A',
                controller: ['$scope', '$filter', function ($scope, $filter) {

                    $scope.fblInit = function (listName, root) {
                        $scope.fblRoot = root[0];
                        $scope.fblFilters = {};

                        $scope.fblPerPage = 10;
                        $scope.fblPage = 1;

                        $scope.fblTotalPages = function () {
                            var num = 0;
                            if ($scope.fblItems) {
                                num = $scope.fblItems.length;

                            }

                            return Math.ceil(num / $scope.fblPerPage);
                        };

                        var fblBootstrapper = $scope.$watch(
                            listName, function (list) {
                                if (list) {
                                    fblBootstrapper();
                                    $scope.fblItems = list;
                                }
                            });
                    };

                    $scope.fblReSort = function (predicate, reverse) {
                        $scope.fblSortPredicate = predicate;
                        $scope.fblSortReverse = reverse;
                    };
                }],
                link: function (scope, element, attrs) {
                    scope.fblInit(attrs.fable, element);
                }
            };
        })
        .filter('fblFilter', ['$filter', function ($filter) {
            return function (input, filters, predicate, reverse, perPage, page) {
                var filtered = $filter('filter')(input, filters);
                var sorted = $filter('orderBy')(filtered, predicate, reverse);

                var paged = [];
                if (sorted) {
                    paged = sorted.slice((page - 1) * perPage, page * perPage);
                }

                return paged;
            };
        }])
        .directive('fblRepeat', ['$compile', function ($compile) {
            return {
                restrict: 'A',
                priority: 5000,
                terminal: true,
                compile: function (element, attrs) {
                    var filterStr = ' | fblFilter:fblFilters:fblSortPredicate:' +
                        'fblSortReverse:fblPerPage:fblPage';

                    attrs.$set('ngRepeat', attrs.fblRepeat + filterStr);

                    var compiled = $compile(element, null, 5000);
                    return function (scope) {
                        compiled(scope);
                    };
                }
            };
        }])
        .directive('fblSort', function () {
            return {
                restrict: 'A',
                link: function (scope, element, attrs) {
                    element.bind('click', function () {
                        var reverse = false;

                        var sortingCls = 'fbl-sorting';
                        var reverseCls = 'fbl-sorting-reverse';

                        var existingSort = scope.fblRoot.querySelector('.' +
                            sortingCls);

                        if (existingSort) {
                            var className = existingSort.className;

                            if (existingSort !== element[0]) {
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

                        element.addClass(sortingCls);
                        scope.fblReSort(attrs.fblSort, reverse);
                        scope.$apply();
                    });
                }
            };
        })
        .directive('fblPager', function () {
            return {
                restrict: 'A',
                link: function (scope, element, attrs) {
                    scope.fblNextPage = function () {
                        if (scope.fblPage < scope.fblTotalPages()) {
                            scope.fblPage++;
                            scope.$apply();
                        }
                    };

                    scope.fblPrevPage = function () {
                        if (1 < scope.fblPage) {
                            if (scope.fblPage <= scope.fblTotalPages()) {
                                scope.fblPage--;
                                scope.$apply();
                            }
                        }
                    };

                    function bindWithSelector(selector, action, fn) {
                        var elms = element[0].querySelectorAll(selector);

                        for (var i = 0; i < elms.length; i++) {
                            elms[i].addEventListener(action, fn);
                        }
                    }

                    bindWithSelector(
                        '[fbl-pager-next]', 'click', scope.fblNextPage);
                    bindWithSelector(
                        '[fbl-pager-prev]', 'click', scope.fblPrevPage);
                }
            };
        })
        .directive('fblFilter', function () {
            return {
                restrict: 'A',
                link: function (scope, element, attrs) {
                    var observer = new MutationObserver(function () {
                        var prop = attrs.fblFilter;
                        var val = (element.value ||
                            scope.$eval(attrs.fblFilterVal));

                        scope.fblFilters[prop] = val;
                    });

                    observer.observe(element[0], {
                        attributes: true,
                        childList: true
                    });

                    scope.$on('$destroy', function () {
                        observer.disconnect();
                    });
                }
            };
        });
})();
