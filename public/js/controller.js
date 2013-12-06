//app
var FBApp = angular.module('FBApp',[]);

//controller
FBApp.controller('FBController', function ($scope, $http){
	var feed = '/facebook/feeds';
	$http.get(feed).success(function(feedItems) {
		
		console.log(feedItems);
		$scope.FBfeed = feedItems.data;
		
	});
$scope.search = '';


$scope.dropFilter = 'name';
$scope.sortOrder = 'false';

});