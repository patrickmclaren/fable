angular.module('fableExample', ['fable'])
    .controller('FableExampleController', ['$scope', function ($scope) {
        $scope.items = [
            { id: 1, name: "Bruce", email: "bruce@wayne.net" },
            { id: 2, name: "Alfred", email: "alfred@wayne.net" }
        ];

        $scope.newItem = function () {
            var name = Math.random().toString(36).substring(2, 7);
            
            $scope.items.push({
                id: $scope.items.length + 1,
                name: name,
                email: name + "@wayne.net"
            });
        }
    }]);
