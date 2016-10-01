angular.module('categories',[
		'myApp.models.categories'
])
.config(['$stateProvider','RouteHelpersProvider',function($stateProvider,helper){
	$stateProvider
		.state('my-app.categories',{
			url:'/categories',
			title: 'Categories',
			controller:'CategoriesListController as categoriesListCtrl',
			templateUrl:helper.basepath('categories/categories-list-tmpl.html')			

			/*views:{'categories@':{
					controller:'categoriesCtrl as categoriesCtrl',
					templateUrl:'app/categories/categories-list-tmpl.html'
				}
			}*/
		})
		.state('my-app.create-category',{
			url:'/categories/create/:id',
			title: 'Save Category',
			controller:'CategoriesCreateController as categoriesCreateCtrl',
			templateUrl:helper.basepath('categories/categories-form-tmpl.html'),
			resolve: helper.resolveFor('parsley')
		})

}])
.controller('CategoriesListController',['$state','CategoriesModel',function($state,CategoriesModel){
		var categoriesListCtrl = this;
		// Categories List
		CategoriesModel.getCategories()
			.then(function(result){
				categoriesListCtrl.categories = result;
		});	

		categoriesListCtrl.deleteCategory = CategoriesModel.deleteCategory;
		
}])
.controller('CategoriesCreateController',['$state','$stateParams','CategoriesModel','$uibModal','$log',function($state,$stateParams,CategoriesModel,$uibModal, $log){
		var categoriesCreateCtrl = this;
		var isNewCategory = true;

		function returnToCategoriesList() {
            $state.go('my-app.categories');
        }

        function cancel(){
        	returnToCategoriesList();
        }	

		function createCategory(){
			if(isNewCategory)
				CategoriesModel.createCategory(categoriesCreateCtrl.category);
			else
				CategoriesModel.updateCategory(categoriesCreateCtrl.category);
			returnToCategoriesList();
		}

		function resetForm(){
			categoriesCreateCtrl.category = {
				title :'',
				description : ''
			}
		}

		if($stateParams.id){
			isNewCategory = false;
			var id = $stateParams.id;
			CategoriesModel.getCategoryById(id)
				.then(function(result){
					categoriesCreateCtrl.category = result;
				});
		}
		else
			resetForm();

		categoriesCreateCtrl.createCategory = createCategory;
		categoriesCreateCtrl.deleteCategory = CategoriesModel.deleteCategory;
		categoriesCreateCtrl.cancel = cancel;


		// Bootstrap Modal Practice
		//----------------------------------------

		categoriesCreateCtrl.items = ['item1', 'item2', 'item3'];
		categoriesCreateCtrl.selected;

  categoriesCreateCtrl.animationsEnabled = true;

  categoriesCreateCtrl.open = function (size) {
    var modalInstance = $uibModal.open({
      animation: categoriesCreateCtrl.animationsEnabled,
      ariaLabelledBy: 'modal-title',
      ariaDescribedBy: 'modal-body',
      templateUrl: 'myModalContent.html',
      controller:function($uibModalInstance ,$scope,items){
	  	  categoriesCreateCtrl.items = items;
		  categoriesCreateCtrl.selected = {
		    item: categoriesCreateCtrl.items[0]
		  };

		  categoriesCreateCtrl.ok = function () {
		    $uibModalInstance.close(categoriesCreateCtrl.selected.item);
		  };

		  categoriesCreateCtrl.cancel = function () {
		    $uibModalInstance.dismiss('cancel');
		  };

	   },
	   controllerAs: 'categoriesCreateCtrl',
      size: size,
      resolve: {
        items: function () {
          return categoriesCreateCtrl.items;
        }
      }
    });

    modalInstance.result.then(function (selectedItem) {
      categoriesCreateCtrl.selected = selectedItem;
    }, function () {
      $log.info('Modal dismissed at: ' + new Date());
    });
  };

  categoriesCreateCtrl.openComponentModal = function () {
    var modalInstance = $uibModal.open({
      animation: categoriesCreateCtrl.animationsEnabled,
      component: 'modalComponent',
      resolve: {
        items: function () {
          return categoriesCreateCtrl.items;
        }
      }
    });

    modalInstance.result.then(function (selectedItem) {
      categoriesCreateCtrl.selected = selectedItem;
    }, function () {
      $log.info('modal-component dismissed at: ' + new Date());
    });
  };

  categoriesCreateCtrl.toggleAnimation = function () {
    categoriesCreateCtrl.animationsEnabled = !categoriesCreateCtrl.animationsEnabled;
  };

  categoriesCreateCtrl.selected = {
    item: categoriesCreateCtrl.items[0]
  };

  categoriesCreateCtrl.ok = function () {
    $uibModalInstance.close(categoriesCreateCtrl.selected.item);
  };

  categoriesCreateCtrl.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };

		
}]);


