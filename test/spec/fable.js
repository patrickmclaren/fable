function newItem(id) {
    var name = Math.random().toString(36).substring(2, 7);

    return {
        id: id,
        name: name,
        email: name + "@wayne.net"
    };
}

describe('fable', function () {
    var $compile;
    var $rootScope;

    var snippet = '<div fable="items"></div>';

    beforeEach(module('fable'));

    beforeEach(inject(function (_$compile_, _$rootScope_) {
        $compile = _$compile_;
        $rootScope = _$rootScope_;

        $rootScope.items = [
            { id: 1, name: 'foo' },
            { id: 2, mame: 'bar' }
        ];

        var fbl = $compile(snippet)($rootScope);

        $rootScope.$apply();
    }));

    it('should have a well-defined root', function () {
        expect($rootScope.fblRoot).not.toBe(undefined);
    });

    it('should provide access to items', function () {
        expect($rootScope.fblItems).not.toBe(undefined);
    });

    it('should provide page information', function () {
        expect($rootScope.fblPage).toEqual(1);
        expect($rootScope.fblPerPage).toEqual(10);
        expect($rootScope.fblTotalPages).toEqual(jasmine.any(Function));
    });

    it('should display the correct number of pages', function () {
        for (var i = 0; i < 10; i++) {
            $rootScope.items.push(newItem($rootScope.items.length + 1));
        }

        expect($rootScope.fblTotalPages()).toEqual(2);
    });
});

describe('fblPager', function () {
    var $compile;
    var $rootScope;

    var snippet = '<div fable="items"><div fbl-pager></div></div>';

    beforeEach(module('fable'));

    beforeEach(inject(function (_$compile_, _$rootScope_) {
        $compile = _$compile_;
        $rootScope = _$rootScope_;

        $rootScope.items = [
            { id: 1, name: 'foo' },
            { id: 2, mame: 'bar' }
        ];

        var fbl = $compile(snippet)($rootScope);

        $rootScope.$apply();
    }));

    it('should provide paging functions', function () {
        expect($rootScope.fblPrevPage).toEqual(jasmine.any(Function));
        expect($rootScope.fblNextPage).toEqual(jasmine.any(Function));
    });

    it('should page items appropriately', function () {
        for (var i = 0; i < 10; i++) {
            $rootScope.items.push(newItem($rootScope.items.length + 1));
        }

        $rootScope.fblPrevPage();
        expect($rootScope.fblPage).toEqual(1);

        $rootScope.fblNextPage();
        expect($rootScope.fblPage).toEqual(2);

        $rootScope.fblNextPage();
        expect($rootScope.fblPage).toEqual(2);
    });
});
