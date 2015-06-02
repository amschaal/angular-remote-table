angular.module("remoteTable", ["remoteTable.tpls", "remoteTableDirectives"]);
angular.module("remoteTable.tpls", ["template/table/paginate.html", "template/table/headers.html", "template/table/header.html","template/table/filter.html","template/table/filter_tags.html"]);
/*
 * <div remote-table headers="headers" url="/api/experiments/">
 *		<input ng-model="params.search" ng-change="load()" placeholder="Search"/>
 *		<table class="table table-striped table-condensed">
 *			<thead remote-headers></thead>
 *			<tr ng-repeat="row in rows">
 *	        <td>{[ row.name ]}</td>
 *	        <td>{[ row.description ]}</td>
 *	      </tr>
 *		</table>
 *		<div remote-pagination></div>
 *	</div> 
 *  
 */

angular.module('remoteTableDirectives', [])
.directive('remoteTable', function($parse) {
	  return {
	    restrict: 'A',
	    scope: true,
	    link: function(scope, element, attrs, ctrl) {
	    	scope.url = attrs.url;
	    	if (!scope.url)
	    		throw "'url' attribute required for remoteTable directive";
	    	if (attrs.preProcessResponse)
	    		this.preProcessResponse = scope.$eval(attrs.preProcessResponse);
	    	if (attrs.postProcessResponse)
	    		this.postProcessResponse = scope.$eval(attrs.postProcessResponse);
	    	if (attrs.processResponse)
	    		scope.process = scope.$eval(attrs.postProcess);
	        scope.initTable();
	      },
	    controller: function($scope, $http, $element){
	    	this.$scope = $scope;
	    	//TO trigger a load, use: "$scope.$broadcast('ReloadTable');"
	    	$scope.$on("ReloadTable",function(){$scope.load();});
	    	$scope.process = function (response,$scope) {
				  $scope.count = response.data.count;
				  if ($scope.settings.page_size){
					  $scope.settings.pages = Math.ceil($scope.count / $scope.settings.page_size)
				  }
				  $scope.rows = response.data.results;
			  };
	    	var processResponse = function (response) {
	    		if (this.preProcessResponse)
					this.preProcessResponse(response,$scope);
	    		$scope.process(response,$scope);
				if (this.postProcessResponse)
					this.postProcessResponse(response,$scope);
			  };
			  
			  
			  
	      	$scope.rows=[];
	    	$scope.params={};
	    	$scope.filters={};
	    	$scope.settings = {'page_size':25,'page':1};
	    	$scope.parameter_map={'order_by':'ordering','page':'page','page_size':'page_size'};
	    	$scope.load = function (page) {
	    	  page = page ? page : 1; //default to first page for any parameter change except for when specifically paging
	    	  $scope.settings.page = page;
	    	  var params=angular.copy($scope.params);
	    	  for (k in $scope.parameter_map){
	    		  if ($scope.settings[k])
	    			  params[$scope.parameter_map[k]]=$scope.settings[k];
	    	  }
	    	  $http.get($scope.url,{'params':params}).then(processResponse);
	    	};
	    	$scope.removeParameter = function(key){
	    		delete $scope.params[key];
	    		$scope.load();
	    	};
	    	$scope.addParameter = function(key,value){
	    		$scope.params[key]=value;
	    		$scope.load();
	    	};
	    	$scope.addFilter = function(key,value,alias){
	    		if(!alias)
	    			alias=key;
	    		$scope.filters[key]={key:key,value:value,alias:alias};
	    		$scope.addParameter(key,value);
	    	}
	    	$scope.removeFilter = function(key){
	    		delete $scope.filters[key];
	    		$scope.removeParameter(key);
	    	}
	    	$scope.getOrderField = function(header){
	    		return header.order_by ? header.order_by : header.name;
	    	};
	    	$scope.orderBy = function(header){
	    		var order_by = $scope.getOrderField(header);
	    		if ($scope.settings.order_by == order_by)
	    			$scope.settings.order_by = '-' + order_by;
	    		else
	    			$scope.settings.order_by = order_by;
	    		$scope.load();
	    	};
	      $scope.initTable = function () {
	        $scope.load();
	      };
	    }
	  }
	})
	.directive('remoteHeaders', function() {
	  return {
	    restrict: 'A',
	    require: '^remoteTable',
	    templateUrl: 'template/table/headers.html',
	    replace: true,
	    link: function ($scope, element, attrs, remoteTable) {
	    	if (!$scope.headers && !attrs.$attr.headers)
	    		throw "Either the 'headers' attribute is required when the parent scope does not have a 'headers' property";
	    	if (!$scope.headers && attrs.$attr.headers)
	    		$scope.headers = $scope.$eval(attrs.headers);
	    }
	   }
	})
	.directive('fieldFilter', function() {
	  return {
	    restrict: 'A',
	    require: '^remoteTable',
	    templateUrl: 'template/table/filter.html',
	    scope: true,
	    replace: true,
	    link: function ($scope, element, attrs, remoteTable) {
    		$scope.field = attrs.field;
    		$scope.alias = attrs.alias;
    		$scope.value = $scope.$eval(attrs.value);
    		$scope.filter = function() {
    			$scope.addFilter($scope.field,$scope.value,$scope.alias);
	    	};
	    	$scope.unfilter = function(){
	    		$scope.removeFilter($scope.field);
	    	}
	    	$scope.filtered = function(){
	    		if (!$scope.filters[$scope.field])
	    			return false;
	    		return $scope.filters[$scope.field].value == $scope.value;
	    	}
	    }
	   }
	})
	.directive('filterTags', function() {
	  return {
	    restrict: 'A',
	    require: '^remoteTable',
	    templateUrl: 'template/table/filter_tags.html',
	    scope: true,
	    replace: true,
	    link: function ($scope, element, attrs, remoteTable) {
//    		$scope.field = attrs.field;
//    		$scope.value = $scope.$eval(attrs.value);
    		
	    }
	   }
	})
//	<span ng-repeat="(k,v) in filters"><a href="#" ng-click="removeParameter(k)">x</a> {[k]}={[v.value]}</span>
	.directive('remoteHeader', function() {
	  return {
	    restrict: 'A',
	    require: '^remoteTable',
	    templateUrl: 'template/table/header.html',
	    replace: true
	   }
	})
	.directive('remotePagination', function() {
	  return {
	    restrict: 'A',
	    require: '^remoteTable',
	    templateUrl: 'template/table/paginate.html',
	    replace: true,
	    link: function ($scope, element, attrs, remoteTable) {
	    	$scope.Range = function(start, end) {
	    	    var result = [];
	    	    for (var i = start; i <= end; i++) {
	    	        result.push(i);
	    	    }
	    	    return result;
	    	};
	    	$scope.setPageSize = function(size){
	    		remoteTable.$scope.settings.page_size=size;
	    		$scope.goToPage(1);
	    	};
	    	$scope.goToPage = function (page){
//	    		remoteTable.$scope.settings.page = page;
	    		remoteTable.$scope.load(page);
	    	};
	    	$scope.next = function(){
	    		if (remoteTable.$scope.settings.page < remoteTable.$scope.settings.pages){
	    			$scope.goToPage(remoteTable.$scope.settings.page + 1)
	    		}
	    	}
	    	$scope.prev = function(){
	    		if (remoteTable.$scope.settings.page > 1){
	    			$scope.goToPage(remoteTable.$scope.settings.page - 1)
	    		}
	    	}
	    }
	   }
	});

angular.module('template/table/header.html', []).run(['$templateCache', function($templateCache) {
	  $templateCache.put('template/table/header.html',
	"<th ng-click=\"orderBy(header)\">{[header.label]} <i ng-if=\"settings.order_by==getOrderField(header) || settings.order_by=='-'+getOrderField(header)\" class=\"glyphicon\" ng-class=\"{'glyphicon-sort-by-attributes': getOrderField(header) == settings.order_by, 'glyphicon-sort-by-attributes-alt': '-'+getOrderField(header) == settings.order_by}\"></i></th>"
	  );
	}]);

angular.module('template/table/headers.html', []).run(['$templateCache', function($templateCache) {
	  $templateCache.put('template/table/headers.html',
	"<thead><tr><th ng-repeat=\"header in headers\" ng-click=\"orderBy(header)\">{[header.label]} <i ng-if=\"settings.order_by==header.name || settings.order_by=='-'+header.name\" class=\"glyphicon\" ng-class=\"{'glyphicon-sort-by-attributes': header.name == settings.order_by, 'glyphicon-sort-by-attributes-alt': '-'+header.name == settings.order_by}\"></i></th></tr></thead>"
	  );
	}]);
angular.module('template/table/filter.html', []).run(['$templateCache', function($templateCache) {
	  $templateCache.put('template/table/filter.html',
			  '<span><a ng-click="filter();" ng-hide="filtered()"><span class="glyphicon glyphicon-filter" aria-hidden="true"></span></a><a ng-show="filtered()" ng-click="unfilter()"><span class="glyphicon glyphicon-ban-circle" aria-hidden="true"></span></a></span>'
	  );
	}]);
angular.module('template/table/filter_tags.html', []).run(['$templateCache', function($templateCache) {
	  $templateCache.put('template/table/filter_tags.html',
			  '<div class="filter-tags"><span class="filter-tag" ng-repeat="(k,v) in filters"><a ng-click="removeFilter(k)">X</a> {[v.alias]} = {[v.value]}</span></div>'
	  );
	}]);
angular.module('template/table/paginate.html', []).run(['$templateCache', function($templateCache) {
	  $templateCache.put('template/table/paginate.html',
			  "<div class=\"row\"> \
			  <div class=\"col-sm-9\"> \
			  	<nav> \
			  	  <ul class=\"pagination\" ng-if=\"settings.pages\"> \
			  	    <li><a ng-click=\"prev()\">&laquo;</a></li> \
			  	    <li ng-repeat=\"p in Range(1,settings.pages)\" ng-class=\"{active: p == settings.page}\"><a ng-click=\"goToPage(p)\">{[p]}</a></li> \
			  	    <li><a ng-click=\"next()\">&raquo;</a></li> \
			  	  </ul> \
			  	</nav> \
			  </div> \
			  	 \
			  <div class=\"col-sm-3\"> \
			  	<div class=\"btn-group\"> \
			  	  <div type=\"button\" ng-repeat=\"size in [10,25,50,100]\" class=\"btn btn-default\" ng-click=\"setPageSize(size)\" ng-class=\"{active: size == settings.page_size}\">{[size]}</div> \
			  	</div> \
			  </div> \
			  </div>"
	   );
	}]);
