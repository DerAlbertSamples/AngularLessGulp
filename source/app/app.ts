module MyApp {

	function routing($routeProvider : ng.route.IRouteProvider) {
			$routeProvider.when("/home", {
				controller : 'HomeController',
				controllerAs : 'ctrl',
				templateUrl : 'app/modules/home/views/home.html'
				});
	}
	angular.module('MyApp', ['home', 'da.directives', 'ngRoute'])
	.config(routing);

}