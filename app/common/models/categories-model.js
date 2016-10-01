angular.module('myApp.models.categories',[

])
.service('CategoriesModel',function($http,$q){
	var model = this,
		URLS={
			FETCH:'app/data/categories.json'
		},
		categories;

		function cacheCategories(result){
			categories = getParentCategories(result.data);
			return categories;
		}

		function getParentCategories(categories){
			var parentCats = [];
			angular.forEach(categories,function(obj,index){
				if(obj.parent_id == 0)
					parentCats.push(obj);
			});
			return parentCats;
		}

		model.getCategories = function(){
			return (categories)?$q.when(categories):$http.get(URLS.FETCH).then(cacheCategories);
		}

		model.getCategoryById = function(id){
			var deferred = $q.defer();

			function findCategory(id){
				return _.find(categories,function(cat){
					 return cat.id == id;
				});
			}

			if(categories){
				deferred.resolve(findCategory(id));
			}
			else{
				model.getCategories()
					.then(function(){
						deferred.resolve(findCategory(id));
					})
			}

			return deferred.promise;

		}

		model.createCategory = function(category){
			if(category){
				category.id = categories.length;
				categories.push(category);
			}
		}

		model.updateCategory = function(category){
			if(category){
				var index = _.findIndex(categories,function(cat){
					return cat.id == category.id;
				});
				categories[index] = category;

			}
		}

		model.deleteCategory = function(category){
			_.remove(categories,function(cat){
					return cat.id == category.id;
			});
		}
})