(function (){
    'use strict';

    angular.module('fable', [])
        .directive('fable', function () {
            return {
                restrict: 'A',
                controller: ['$scope', '$filter', function ($scope, $filter) {

                    ////////////////////////////////////////////////////////////
                    // Start Here
                    ////////////////////////////////////////////////////////////

                    $scope.fblInit = function (listName, root) {
                        $scope.fblRoot = root[0];
                        $scope.fblFilters = {};

                        $scope.fblTotalPages = 1;
                        $scope.fblPerPage = 10;
                        $scope.fblPage = 1;

                        var fblBootstrapper = $scope.$watch(listName, function (list) {
                            if (list) {
                                fblBootstrapper();

                                useList(list);
                                watchList(listName);
                            }
                        });
                    };

                    ////////////////////////////////////////////////////////////
                    // List Management
                    ////////////////////////////////////////////////////////////

                    function useList(list) {
                        $scope.fblItems = list;

                        $scope.fblTotalPages = Math.ceil(
                            $scope.fblItems.length / $scope.fblPerPage
                        );
                    }

                    function watchList(listName) {
                        $scope.$watch(listName, function (list) {
                            if (list !== $scope.fblItems) {
                                useList(list);
                            }
                        });
                    }

                    ////////////////////////////////////////////////////////////
                    // Sorting
                    ////////////////////////////////////////////////////////////

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
                var paged = sorted ? sorted.slice((page-1)*perPage, page*perPage) : [];

                return paged;
            };
        }])
        .directive('fblRepeat', ['$compile', function ($compile) {
            return {
                restrict: 'A',
                priority: 5000,
                terminal: true,
                compile: function (element, attrs) {
                    var filterStr = ' | fblFilter:fblFilters:fblSortPredicate:fblSortReverse:fblPerPage:fblPage';
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
                controller: ['$scope', function ($scope) {
                    $scope.fblNextPage = function () {
                        if ($scope.fblPage < $scope.fblTotalPages) {
                            ++$scope.fblPage;
                        }
                    };

                    $scope.fblPrevPage = function () {
                        if (1 < $scope.fblPage && $scope.fblPage <= $scope.fblTotalPages) {
                            --$scope.fblPage;
                        }
                    };
                }]
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