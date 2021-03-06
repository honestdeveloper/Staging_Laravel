(function () {
    'use strict';

    angular
            .module('zoomtivity')
            .filter('dateSmall', function () {
                return function (inp) {
                    if (inp) {
                        inp *= 1000;
                        var date = new Date(inp);
                        var dateString = (date.getMonth() + 1) + '/' + date.getDate();
                        if (date.getDate() === new Date(Date.now()).getDate()) {
                            return 'Today';
                        }
                        return dateString;
                    }
                    return null;
                }
            })
            .filter('dateLetters', function () {
                return function (inp) {
                    if (inp) {
                        inp *= 1000;
                        var date = new Date(inp);
                        var weekday = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]
                        return weekday[date.getDay()];
                    }
                    return null;
                }
            })
            .filter('windDirection', function () {
                return function (inp) {
                    if (inp) {
                        var directions = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
                        var index = Math.floor(((inp + (360 / 16) / 2) % 360) / (360 / 16));
                        return directions[index];
                    }
                    return null;
                }
            })
            .filter('weatherByDay', function () {
                return function (inp, time, offset) {
                    if (inp) {
                        var timeOffset = new Date(Date.now()).getTimezoneOffset() * -1 / 60;
                        timeOffset -= offset;
                        // console.log(timeOffset);
                        var selectedDate = new Date(time * 1000);
                        selectedDate.setHours(selectedDate.getHours() - timeOffset);
                        var maxDate = new Date(selectedDate);
                        maxDate.setDate(selectedDate.getDate());
                        maxDate.setHours(24);
                        maxDate.setMinutes(0);
                        // console.log(selectedDate.getTimezoneOffset());
                        // console.log(maxDate);
                        var arr = [];
                        var i = 0;
                        var len = inp.length;
                        var itemDate;
                        for (; i < len; i++) {
                            itemDate = new Date(inp[i].time * 1000);
                            if (itemDate >= selectedDate && itemDate < maxDate) {
                                arr.push(inp[i]);
                            }
                        }
                        return arr;
                    }
                    return null;
                }
            });

    angular
            .module('zoomtivity')
            .directive('weather', Weather);

    /** @ngInject */
    function Weather() {
        return {
            restrict: 'E',
            templateUrl: '/app/components/weather/weather.html',
            scope: {
                lat: '=',
                lng: '=',
                units: '='
            },
            controller: WeatherController,
            controllerAs: 'Weather',
            bindToController: true
        };

        /** @ngInject */
        function WeatherController($scope, $rootScope, $http, MapService, API_URL) {
            var vm = this;
            vm.color = '#0b2639';
            vm.location = 'N/A';
            vm.data = {};
            vm.tab = 0;
            vm.selected = {};
            vm.unitsObj = {
                'si': {
                    temperature: 'C',
                    speed: 'm/s',
                },
                'us': {
                    temperature: 'F',
                    speed: 'mph',
                }
            };

            $scope.$watch(function () {
                return (vm.lat);
            }, function () {
                vm.init();
            });

            $scope.$watch(function () {
                return (vm.units);
            }, function () {
                vm.init();
            });

            vm.toggleUnits = function () {
                if (vm.units === 'si') {
                    vm.units = 'us';
                    $rootScope.weatherUnits = 'us';
                } else {
                    vm.units = 'si';
                    $rootScope.weatherUnits = 'si';
                }
                MapService.showWeatherMarkers();
                vm.init();
            };

            vm.changeTab = function (index) {
                vm.tab = index;
                if (index == 0) {
                    vm.selected = vm.data.currently;
                } else {
                    vm.selected = vm.data.daily.data[index];
                }
            };

            vm.init = function () {

                if (vm.lat && vm.lng) {

                    $http.jsonp('https://nominatim.openstreetmap.org/reverse', {
                        params: {
                            lat: vm.lat,
                            lon: vm.lng,
                            "accept-language": 'en',
                            format: 'json',
                            json_callback: 'JSON_CALLBACK'
                        }
                    })
                        .then(function (resp) {
                            if (resp.status === 200) {
                                if (resp.data.address) {
                                    vm.location = resp.data.address.city || resp.data.address.county || resp.data.address.state || resp.data.address.country;
                                } else {
                                    vm.location = 'N/A';
                                }
                            }
                        });
                    $http.get(API_URL + '/xapi/weather/darksky', {
                        params: {
                            lat: vm.lat,
                            lng: vm.lng,
                            extend: 'hourly',
                            lang: 'en',
                            units: vm.units,
                        }
                    })
                        .then(function (resp) {
                            if (resp.status === 200) {
                                vm.tab = 0;
                                resp.data.daily.data.pop();
                                vm.data = resp.data;
                                vm.selected = vm.data.currently;
                            }
                        });
                }
            }
        }
    }
})();