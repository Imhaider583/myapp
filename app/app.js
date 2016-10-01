
// MY APP START
// ----------------------------------- 

var App = angular.module("mainApp",[
	"ui.bootstrap",
	"oc.lazyLoad",
	"chieffancypants.loadingBar",
	"ngAnimate"
])
.run(['$rootScope',function($rootScope){
	
	// Scope Globals
    // ----------------------------------- 
      $rootScope.app = {
        name: 'My App',
        description: 'This is my learning app',
        year: ((new Date()).getFullYear()),
      };

      $rootScope.user = {
        name:     'Imran Haider',
        job:      'ng-Dev',
        picture:  'imran.jpg'
      };
}])
.config(['$ocLazyLoadProvider', 'APP_REQUIRES', function ($ocLazyLoadProvider, APP_REQUIRES) {
    'use strict';

    // Lazy Load modules configuration
    $ocLazyLoadProvider.config({
      debug: false,
      events: true,
      modules: APP_REQUIRES.modules
    })
}])
.config(['cfpLoadingBarProvider', function(cfpLoadingBarProvider) {
    cfpLoadingBarProvider.includeBar = true;
    cfpLoadingBarProvider.includeSpinner = true;
    cfpLoadingBarProvider.latencyThreshold = 500;
    cfpLoadingBarProvider.parentSelector = 'header';
}]);


/**=========================================================
 * CONSTANTS
 * Define constants to inject across the application
 =========================================================*/
App
 .constant('APP_REQUIRES', {
    // jQuery based and standalone scripts
    scripts: {
      'parsley':            ['vendor/parsleyjs/dist/parsley.min.js'],
      'icons':              ['vendor/fontawesome/css/font-awesome.min.css']      
    },

    // Angular based script (use the right module name)
    modules: [
     { name: 'toaster', files: ['vendor/angularjs-toaster/toaster.js','vendor/angularjs-toaster/toaster.css'] }
  ]
})
;

 /**=========================================================
 * RouteHelpers
 * Provides helper functions for routes definition
 =========================================================*/

App.provider('RouteHelpers', ['APP_REQUIRES', function (appRequires) {
  "use strict";
  // Set here the base of the relative path
  // for all app views
  this.basepath = function (uri) {
    return 'app/' + uri;
  };


  // Generates a resolve object by passing script names
  // previously configured in constant.APP_REQUIRES
  this.resolveFor = function () {
    var _args = arguments;
    return {
      deps: ['$ocLazyLoad','$q', function ($ocLL, $q) {
        // Creates a promise chain for each argument
        var promise = $q.when(1); // empty promise
        for(var i=0, len=_args.length; i < len; i ++){
          promise = andThen(_args[i]);
        }
        return promise;

        // creates promise to chain dynamically
        function andThen(_arg) {
        	console.log(_arg);
          // also support a function that returns a promise
          if(typeof _arg == 'function')
              return promise.then(_arg);
          else
              return promise.then(function() {
                // if is a module, pass the name. If not, pass the array
                var whatToLoad = getRequired(_arg);
                // simple error check
                if(!whatToLoad) return $.error('Route resolve: Bad resource name [' + _arg + ']');
                // finally, return a promise
                return $ocLL.load( whatToLoad );
              });
        }
        // check and returns required data
        // analyze module items with the form [name: '', files: []]
        // and also simple array of script files (for not angular js)
        function getRequired(name) {
          if (appRequires.modules)
              for(var m in appRequires.modules)
                  if(appRequires.modules[m].name && appRequires.modules[m].name === name)
                      return appRequires.modules[m];
          return appRequires.scripts && appRequires.scripts[name];
        }

      }]};
  }; // resolveFor

  // not necessary, only used in config block for routes
  this.$get = function(){};

}]);


/**=========================================================
 * Extended myApp Modules
 * Provides helper functions for routes definition
 =========================================================*/

var myApp = angular.module("myApp",[
	"mainApp",
	"ui.router",
	"categories",
	"categories.subcategories",
	"uploader"
]);


/**=========================================================
 * Configuration
 * App routes and resources configuration
 =========================================================*/

myApp.config(['$stateProvider','$urlRouterProvider','RouteHelpersProvider',function($stateProvider,$urlRouterProvider,helper){
	$stateProvider
		.state('my-app',{
		      url:'/my-app',
		      title:'My App',
		      templateUrl:helper.basepath('app-tmpl.html'),
		      resolve: helper.resolveFor('icons'),
		      controller: 'myAppController',
		      abstract:true
		      
		})
		.state('my-app.dashboard',{
		      url:'/dashboard',
		      title:'Dashboard',
		      templateUrl:helper.basepath('dashboard.html')
		});
		$urlRouterProvider.otherwise('/my-app/dashboard');

}])
;

/**=========================================================
 * MAIN CONTROLLER
 * Main Application Controller
 =========================================================*/

 myApp.controller('myAppController',['$rootScope','$state','$window','$timeout','cfpLoadingBar',function($rootScope,$state,$window,$timeout,cfpLoadingBar){
 	// Loading bar transition
    // ----------------------------------- 
    var thBar;
    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
        if($('header').length) // check if bar container exists
          thBar = $timeout(function() {
            cfpLoadingBar.start();
          },0); // sets a latency Threshold
    });
    $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
        event.targetScope.$watch("$viewContentLoaded", function () {
        	$timeout(function() {
            	$timeout.cancel(thBar);
            	cfpLoadingBar.complete();
          	},2000);
        });
    });


    // Hook not found
    $rootScope.$on('$stateNotFound',
      function(event, unfoundState, fromState, fromParams) {
          console.log(unfoundState.to); // "lazy.state"
          console.log(unfoundState.toParams); // {a:1, b:2}
          console.log(unfoundState.options); // {inherit:false} + default options
      });
    // Hook error
    $rootScope.$on('$stateChangeError',
      function(event, toState, toParams, fromState, fromParams, error){
        console.log(error);
      });
    // Hook success
    $rootScope.$on('$stateChangeSuccess',
      function(event, toState, toParams, fromState, fromParams) {
        // display new view from top
        $window.scrollTo(0, 0);
        // Save the route title
        $rootScope.currTitle = $state.current.title;
      });

 	$rootScope.currTitle = $state.current.title;
    $rootScope.pageTitle = function() {
      var title = $rootScope.app.name + ' - ' + ($rootScope.currTitle || $rootScope.app.description);
      document.title = title;
      return title; 
    };

 }]);



