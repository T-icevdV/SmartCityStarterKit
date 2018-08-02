/*
 * bae-search-filters
 * https://github.com/Wirecloud/bae-search-filters-widget
 *
 * Copyright (c) 2016-2017 CoNWeT, Universidad Politécnica de Madrid
 * Licensed under the Apache-2.0 license.
 */

/* globals MashupPlatform, angular */
angular
    .module('widget', ['ngMaterial', 'ngResource'])
    .controller('WidgetCtrl', function ($scope, $resource) {
        "use strict";

        var init = function init() {

            $scope.data = {};

            $scope.filters = {
                catalogue: getCatalogueList(),
                category: getCategoryList(),
                offeringType: [
                    {value: false, title: 'Single'},
                    {value: true, title: 'Bundle'}
                ]
            };

            $scope.$watchCollection('data', function () {
                buildFilters();
            });

            MashupPlatform.prefs.registerCallback(function () {
                $scope.filters.catalogue = getCatalogueList();
                $scope.filters.category = getCategoryList();
            });
        };

        var buildFilters = function buildFilters() {
            var filters = {};
            filters.isBundle = $scope.data.offeringType;
            filters["catalogue.id"] = $scope.data.catalogueId;
            filters["category.id"] = $scope.data.categoryId;

            MashupPlatform.wiring.pushEvent('filters', filters);
        };

        var getCatalogueList = function getCatalogueList() {
            var url = MashupPlatform.prefs.get('server_url') + '/DSProductCatalog/api/catalogManagement/v2/catalog';

            return $resource(url).query({
                lifecycleStatus: 'Launched'
            });
        };

        var getCategoryList = function getCategoryList() {
            var url = MashupPlatform.prefs.get('server_url') + '/DSProductCatalog/api/catalogManagement/v2/category';

            return $resource(url).query({
                lifecycleStatus: 'Launched'
            });
        };

        init();
    });
