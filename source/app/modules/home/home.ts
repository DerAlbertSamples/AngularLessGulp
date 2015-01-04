module home {

	class HomeController {
		public message : string;
		constructor() {
			this.message = "love";
		}
	}

	angular.module('home', [])
		.controller('HomeController', HomeController);
}