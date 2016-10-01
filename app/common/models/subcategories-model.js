angular.module('myApp.models.subcategories',[

])
.service('SubcategoriesModel',function($http,$q){
	var model = this,
		URLS={
			FETCH:'app/data/categories.json'
		},
		subcategories,
		allCategories;

		function cacheSubcategories(result){
			subcategories = getSubCategories(result.data);
			return subcategories;
		}

		function cacheAllcategories(result){
			allCategories = result.data;
			return allCategories;
		}

		function getSubCategories(subcategories){
			var subCats = [];
			angular.forEach(subcategories,function(obj,index){
				if(obj.parent_id > 0)
					subCats.push(obj);
			});
			return subCats;
		}

		model.getAllCategories = function(){
			return (allCategories)?$q.when(allCategories):$http.get(URLS.FETCH).then(cacheAllcategories);
		}

		model.getSubcategories = function(){
			return (subcategories)?$q.when(subcategories):$http.get(URLS.FETCH).then(cacheSubcategories);
		}

		model.getSubcategoryById = function(id){
			var deferred = $q.defer();

			function findCategory(id){
				return _.find(subcategories,function(cat){
					 return cat.id == id;
				});
			}

			if(subcategories){
				deferred.resolve(findCategory(id));
			}
			else{
				model.getSubcategories()
					.then(function(){
						deferred.resolve(findCategory(id));
					})
			}

			return deferred.promise;

		}

		model.createSubcategory = function(category){
			if(category){
				category.id = subcategories.length;
				category.parent_id = category.parent_cat.id;
				category.parent_category = category.parent_cat.title;
				subcategories.push(category);
			}
		}

		model.updateCategory = function(category){
			if(category){
				var index = _.findIndex(subcategories,function(cat){
					return cat.id == category.id;
				});
				console.log(index);
				category.parent_id = category.parent_cat.id;
				category.parent_category = category.parent_cat.title;
				subcategories[index] = category;

			}
		}

		model.deleteCategory = function(category){
			_.remove(subcategories,function(cat){
					return cat.id == category.id;
			});
		}
})