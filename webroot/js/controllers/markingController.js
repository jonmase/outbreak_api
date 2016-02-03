(function() {
	angular.module('flu.marking')
		.controller('MarkingController', MarkingController);

	MarkingController.$inject = ['$q', '$window', '$uibModal', 'markingFactory', 'modalFactory', 'techniqueFactory', 'sampleFactory', 'schoolFactory', 'siteFactory', 'assayFactory'];
	
	function MarkingController($q, $window, $uibModal, markingFactory, modalFactory, techniqueFactory, sampleFactory, schoolFactory, siteFactory, assayFactory) {
		var vm = this;
		
		vm.me = MY_ID;
		vm.status = 'loading';
		vm.currentUserIndex = null;
		vm.currentUser = null;
		
		//Bindable Members - variables
		vm.marks = [];
		
		vm.rolesForFilter = [
			{
				value: 'Student',
				label: 'Students',
			},
			{
				value: 'Demonstrator',
				label: 'Demonstrators',
			},
			{
				value: '',
				label: 'Both',
			}
		];
		vm.roleToShow = vm.rolesForFilter[2];
		
		vm.submitStatusesForFilter = [
			{
				value: 1,
				label: 'Submitted',
			},
			{
				value: 0,
				label: 'Not Submitted',
			},
			{
				value: -1,
				label: 'Both',
			},
		];
		vm.submitStatusToShow = vm.submitStatusesForFilter[2];
		
		/*vm.markOptions = [
			{
				value: 'plus',
				label: 'Satis plus',
			},
			{
				value: 'satis',
				label: 'Satis',
			},
			{
				value: 'fail',
				label: 'Fail',
			},
		];*/
		vm.markOptions = ['Satis plus', 'Satis', 'Fail',];
		
		vm.markStatusesForFilter = [
			{
				value: 1,
				label: 'Marked',
			},
			{
				value: 0,
				label: 'Not Marked',
			},
			{
				value: -1,
				label: 'Both',
			},
		];
		vm.markStatusToShow = vm.markStatusesForFilter[2];
		
		
		//Bindable Members - methods
		vm.hideUser = hideUser;
		vm.markUser = markUser;
		vm.showUser = showUser;
		vm.save = save;
		vm.edit = edit;
		vm.cancel = cancel;
		
		//Actions
		var usersPromise = markingFactory.loadUsers();

		var techniquesPromise = techniqueFactory.loadTechniques();
		var sitesPromise = siteFactory.loadSites();
		var schoolsPromise = schoolFactory.loadSchools();
		var typesPromise = sampleFactory.loadTypes();
		var standardsPromise = assayFactory.loadStandards();
		
		$q.all([usersPromise, techniquesPromise, sitesPromise, schoolsPromise, typesPromise, standardsPromise]).then(
			function(result) {
				console.log(result);
				vm.users = markingFactory.getUsers();
				vm.techniques = techniqueFactory.getTechniques('lab');
				vm.sites = siteFactory.getSites();;
				vm.schools = schoolFactory.getSchools();
				vm.types = sampleFactory.getSampleTypes();
				vm.standards = assayFactory.getStandards();
				vm.status = 'index';
			}, 
			function(reason) {
				console.log("Error: " + reason);
				$uibModal.open(modalFactory.getErrorModalOptions());
			}
		);
		
		//Functions
		function hideUser(userIndex) {
			//alert(userIndex);
		}
		function showUser(userIndex) {
			//alert(userIndex);
		}
		
		function markUser(userIndex) {
			vm.currentUserIndex = userIndex;
			vm.currentUser = vm.users[vm.currentUserIndex];		
			//If user has not been marked, lock them and then take them to the marking interface
			if(!vm.currentUser.marked) {
				lockUser();
			}
			//If user has already been marked, just take them to the marking interface
			else {
				vm.status = 'mark';
			}
		}
		
		function cancel() {
			var lockPromise = markingFactory.setLock(vm.currentUserIndex, false);
			
			lockPromise.then(
				function(result) {
					console.log(result);
					$window.location.reload();
				}, 
				function(reason) {
					console.log("Error: " + reason);
					$uibModal.open(modalFactory.getErrorModalOptions());
				}
			);
		}
		
		function lockUser() {
			var lockPromise = markingFactory.setLock(vm.currentUserIndex, true);
			lockPromise.then(
				function(result) {
					console.log(result);
					vm.status = 'mark';
					vm.currentUser.editing = 1;
				}, 
				function(reason) {
					console.log("Error: " + reason);
					if(reason === 'locked') {
						$uibModal.open(modalFactory.getMarkingLockedModalOptions());
					}
					else {
						$uibModal.open(modalFactory.getErrorModalOptions());
					}
				}
			);

		}
		
		function edit() {
			lockUser();
		}
		
		function save() {
			var markPromise = markingFactory.save(vm.currentUserIndex);
			markPromise.then(
				function(result) {
					console.log(result);
				}, 
				function(reason) {
					console.log("Error: " + reason);
					$uibModal.open(modalFactory.getErrorModalOptions());
				}
			);

		}
	}
})();