//app
var FBApp = angular.module('FBApp',[]);

//controller
FBApp.controller('FBController', function ($scope, $http){
	var feed = '/feeds';
	$http.get(feed).success(function(feedItems) {
		
		console.log(feedItems);
		$scope.FBfeed = feedItems;
		
	});
$scope.search = '';


$scope.dropFilter = 'name';
$scope.sortOrder = 'false';

});