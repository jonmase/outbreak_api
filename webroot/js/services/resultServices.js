(function() {
	angular.module('flu.results')
		.factory('resultFactory', resultFactory);
		
	resultFactory.$inject = ['schoolFactory', 'techniqueFactory', 'assayFactory'];
		
	function resultFactory(schoolFactory, techniqueFactory, assayFactory) {
		//Variables
		var sections = readSections();
		var assays = assayFactory.getAssays();
		//var results = readResults();
		var notes = readNotes();
		var defaultInitialTechnique = 6;
		var currentTechniqueId = angular.copy(defaultInitialTechnique);
		var techniqueChangedManually = false;
		setDisabledTechniques();
		sections[defaultInitialTechnique].active = true;
		
		//Exposed Methods
		var factory = {
			getCurrentTechniqueId: getCurrentTechniqueId,
			getNotes: getNotes,
			//getResults: getResults,
			getSections: getSections,
			readQuickVue: readQuickVue,
			setCurrentTechniqueId: setCurrentTechniqueId,
			setDisabledTechniques: setDisabledTechniques,
		}
		return factory;
		
		//Methods

		function getCurrentTechniqueId() {
			return currentTechniqueId;
		}
		function getNotes() {
			return notes;
		}
		/*function getResults() {
			return results;
		}*/
		function getSections() {
			return sections;
		}
		
		function readNotes() {
			//API: Get these from the DB
			var notes = {};
			for(var i = 0; i < sections.length; i++) {
				notes[sections[i].id] = "";
			}
			return notes;
		}
		
		//Add quickvue
		function readQuickVue() {
			var quickvue = {
				id: 'quickvue',
				menu: 'QuickVue',
				name: 'QuickVue',
			};
			return quickvue;
		}

		function readSections() {
			var sections = angular.copy(techniqueFactory.readTechniques(false,true));	//Get lab only but not revision only techniques
			sections.push(readQuickVue());
			sections.push(angular.copy(techniqueFactory.getFluExtra()));	//Add additional info
			
			return sections;
		}
		
		function setCurrentTechniqueId(techniqueId) {
			currentTechniqueId = techniqueId;
			techniqueChangedManually = true;
		}
		
		function setDisabledTechniques(setCurrentTechnique) {
			var initialTechniqueId = angular.copy(defaultInitialTechnique);
			for(var i = 0; i < sections.length; i++) {
				if(typeof(assays.saved.counts[i]) !== "undefined") {
					if(assays.saved.counts[i].total > 0) {
						sections[i].disabled = false;	//Make sure section is not disabled
						//If this section has results, make it the initial technique, if initial technique has not already been changed
						if(!techniqueChangedManually && initialTechniqueId === defaultInitialTechnique) {
							for(var j = 0; j < sections.length; j++) {
								sections[j].active = false;	//Set all sections to inactive
							}
							sections[i].active = true;	//Set this section to active
							initialTechniqueId = angular.copy(i);
							currentTechniqueId = angular.copy(i);
						}
					}
					else {
						//Disable normal technique sections (i.e. those with results defined in the technique) with no results
						if(typeof(sections[i].results) !== "undefined") {
							sections[i].disabled = true;
						}
					}
				}
			}
		}
		
		function setNotes() {
			//API: Save notes to DB
			//TODO: Call this - autosave? on blur? save button? 
		}
		
		/*function readResults() {
			//Replaced values with images
			//Results for each assay - results[techniqueId][siteId][schoolId][childId][typeId]
			var results = [
				[	//PFU
					[	//np
						[	//school 
							[null,'<1 PFU/ml'],	//ja (a, c)
							[null,'<1 PFU/ml'],	//js (a, c)
							[null,'<1 PFU/ml'],	//kt (a, c)
							[null,'<1 PFU/ml'],	//dl (a, c)
						],
						[	//school 2
							['>100 PFU/ml','<1 PFU/ml'],	//jb (a, c)
							['>100 PFU/ml','<1 PFU/ml'],	//ai (a, c)
							['>100 PFU/ml','<1 PFU/ml'],	//jo (a, c)
						],
					],
					[	//blood
						[	//school 
							['<1 PFU/ml','<1 PFU/ml'],	//ja (a, c)
							['<1 PFU/ml','<1 PFU/ml'],	//js (a, c)
							['<1 PFU/ml','<1 PFU/ml'],	//kt (a, c)
							['<1 PFU/ml','<1 PFU/ml'],	//dl (a, c)
						],
						[	//school 2
							['<1 PFU/ml','<1 PFU/ml'],	//jb (a, c)
							['<1 PFU/ml','<1 PFU/ml'],	//ai (a, c)
							['<1 PFU/ml','<1 PFU/ml'],	//jo (a, c)
						],
					],
					[	//csf
						[	//school 
							[null,'<1 PFU/ml'],	//ja (a, c)
							[null,'<1 PFU/ml'],	//js (a, c)
							[null,'<1 PFU/ml'],	//kt (a, c)
							[null,'<1 PFU/ml'],	//dl (a, c)
						],
						[	//school 2
							['<1 PFU/ml','<1 PFU/ml'],	//jb (a, c)
							['<1 PFU/ml','<1 PFU/ml'],	//ai (a, c)
							['<1 PFU/ml','<1 PFU/ml'],	//jo (a, c)
						],
					],
					[	//urine
						[	//school 
							[null,'<1 PFU/ml'],	//ja (a, c)
							[null,'<1 PFU/ml'],	//js (a, c)
							[null,'<1 PFU/ml'],	//kt (a, c)
							[null,'<1 PFU/ml'],	//dl (a, c)
						],
						[	//school 2
							['<1 PFU/ml','<1 PFU/ml'],	//jb (a, c)
							['<1 PFU/ml','<1 PFU/ml'],	//ai (a, c)
							['<1 PFU/ml','<1 PFU/ml'],	//jo (a, c)
						],
					],
				],
				[	//HA
					[	//np
						[	//school 
							[null,'<1/64'],	//ja (a, c)
							[null,'<1/64'],	//js (a, c)
							[null,'<1/64'],	//kt (a, c)
							[null,'<1/64'],	//dl (a, c)
						],
						[	//school 2
							['1/128','<1/64'],	//jb (a, c)
							['1/128','<1/64'],	//ai (a, c)
							['1/128','<1/64'],	//jo (a, c)
						],
					],
					[	//blood
						[	//school 
							[null,'<1/64'],	//ja (a, c)
							[null,'<1/64'],	//js (a, c)
							[null,'<1/64'],	//kt (a, c)
							[null,'<1/64'],	//dl (a, c)
						],
						[	//school 2
							['<1/64','<1/64'],	//jb (a, c)
							['<1/64','<1/64'],	//ai (a, c)
							['<1/64','<1/64'],	//jo (a, c)
						],
					],
					[	//csf
						[	//school 
							[null,'<1/64'],	//ja (a, c)
							[null,'<1/64'],	//js (a, c)
							[null,'<1/64'],	//kt (a, c)
							[null,'<1/64'],	//dl (a, c)
						],
						[	//school 2
							['<1/64','<1/64'],	//jb (a, c)
							['<1/64','<1/64'],	//ai (a, c)
							['<1/64','<1/64'],	//jo (a, c)
						],
					],
					[	//urine
						[	//school 
							[null,'<1/64'],	//ja (a, c)
							[null,'<1/64'],	//js (a, c)
							[null,'<1/64'],	//kt (a, c)
							[null,'<1/64'],	//dl (a, c)
						],
						[	//school 2
							['<1/64','<1/64'],	//jb (a, c)
							['<1/64','<1/64'],	//ai (a, c)
							['<1/64','<1/64'],	//jo (a, c)
						],
					],
				],
				[	//HAI
					[	//np
						[	//school 
							[null,'H1: <1/64; H3: <1/64; H5: <1/64'],	//ja (a, c)
							[null,'H1: <1/64; H3: <1/64; H5: <1/64'],	//js (a, c)
							[null,'H1: <1/64; H3: <1/64; H5: <1/64'],	//kt (a, c)
							[null,'H1: <1/64; H3: <1/64; H5: <1/64'],	//dl (a, c)
						],
						[	//school 2
							['H1: <1/64; H3: <1/64; H5: <1/64','H1: <1/64; H3: <1/64; H5: <1/64'],	//jb (a, c)
							['H1: <1/64; H3: <1/64; H5: <1/64','H1: <1/64; H3: <1/64; H5: <1/64'],	//ai (a, c)
							['H1: <1/64; H3: <1/64; H5: <1/64','H1: <1/64; H3: <1/64; H5: <1/64'],	//jo (a, c)
						],
					],
					[	//blood
						[	//school 
							[null,'H1: 1/1024; H3: 1/64; H5: <1/64'],	//ja (a, c)
							[null,'H1: 1/512; H3: 1/64; H5: <1/64'],	//js (a, c)
							[null,'H1: 1/1024; H3: 1/128; H5: <1/64'],	//kt (a, c)
							[null,'H1: 1/1024; H3: 1/128; H5: <1/64'],	//dl (a, c)
						],
						[	//school 2
							['H1: 1/64; H3: 1/128; H5: <1/64','H1: 1/512; H3: 1/128; H5: <1/64'],	//jb (a, c)
							['H1: 1/128; H3: 1/64; H5: <1/64','H1: 1/1024; H3: 1/64; H5: <1/64'],	//ai (a, c)
							['H1: 1/64; H3: 1/128; H5: <1/64','H1: 1/512; H3: 1/128; H5: <1/64'],	//jo (a, c)
						],
					],
					[	//csf
						[	//school 
							[null,'H1: <1/64; H3: <1/64; H5: <1/64'],	//ja (a, c)
							[null,'H1: <1/64; H3: <1/64; H5: <1/64'],	//js (a, c)
							[null,'H1: <1/64; H3: <1/64; H5: <1/64'],	//kt (a, c)
							[null,'H1: <1/64; H3: <1/64; H5: <1/64'],	//dl (a, c)
						],
						[	//school 2
							['H1: <1/64; H3: <1/64; H5: <1/64','H1: <1/64; H3: <1/64; H5: <1/64'],	//jb (a, c)
							['H1: <1/64; H3: <1/64; H5: <1/64','H1: <1/64; H3: <1/64; H5: <1/64'],	//ai (a, c)
							['H1: <1/64; H3: <1/64; H5: <1/64','H1: <1/64; H3: <1/64; H5: <1/64'],	//jo (a, c)
						],
					],
					[	//urine
						[	//school 
							[null,'H1: <1/64; H3: <1/64; H5: <1/64'],	//ja (a, c)
							[null,'H1: <1/64; H3: <1/64; H5: <1/64'],	//js (a, c)
							[null,'H1: <1/64; H3: <1/64; H5: <1/64'],	//kt (a, c)
							[null,'H1: <1/64; H3: <1/64; H5: <1/64'],	//dl (a, c)
						],
						[	//school 2
							['H1: <1/64; H3: <1/64; H5: <1/64','H1: <1/64; H3: <1/64; H5: <1/64'],	//jb (a, c)
							['H1: <1/64; H3: <1/64; H5: <1/64','H1: <1/64; H3: <1/64; H5: <1/64'],	//ai (a, c)
							['H1: <1/64; H3: <1/64; H5: <1/64','H1: <1/64; H3: <1/64; H5: <1/64'],	//jo (a, c)
						],
					],
				],
				[	//qRT-PCRH
					[	//np
						[	//school 1
							[null,'H1: -ve; H2: -ve; H5: -ve; H7: -ve'],	//ja (a, c)
							[null,'H1: -ve; H2: -ve; H5: -ve; H7: -ve'],	//js (a, c)
							[null,'H1: -ve; H2: -ve; H5: -ve; H7: -ve'],	//kt (a, c)
							[null,'H1: -ve; H2: -ve; H5: -ve; H7: -ve'],	//dl (a, c)
						],
						[	//school 2
							['H1: +ve; H2: -ve; H5: -ve; H7: -ve','H1: -ve; H2: -ve; H5: -ve; H7: -ve'],	//jb (a, c)
							['H1: +ve; H2: -ve; H5: -ve; H7: -ve','H1: -ve; H2: -ve; H5: -ve; H7: -ve'],	//ai (a, c)
							['H1: +ve; H2: -ve; H5: -ve; H7: -ve','H1: -ve; H2: -ve; H5: -ve; H7: -ve'],	//jo (a, c)
						],
					],
					[	//blood
						[	//school 1
							[null,'H1: -ve; H2: -ve; H5: -ve; H7: -ve'],	//ja (a, c)
							[null,'H1: -ve; H2: -ve; H5: -ve; H7: -ve'],	//js (a, c)
							[null,'H1: -ve; H2: -ve; H5: -ve; H7: -ve'],	//kt (a, c)
							[null,'H1: -ve; H2: -ve; H5: -ve; H7: -ve'],	//dl (a, c)
						],
						[	//school 2
							['H1: -ve; H2: -ve; H5: -ve; H7: -ve','H1: -ve; H2: -ve; H5: -ve; H7: -ve'],	//jb (a, c)
							['H1: -ve; H2: -ve; H5: -ve; H7: -ve','H1: -ve; H2: -ve; H5: -ve; H7: -ve'],	//ai (a, c)
							['H1: -ve; H2: -ve; H5: -ve; H7: -ve','H1: -ve; H2: -ve; H5: -ve; H7: -ve'],	//jo (a, c)
						],
					],
					[	//csf
						[	//school 
							[null,'H1: -ve; H2: -ve; H5: -ve; H7: -ve'],	//ja (a, c)
							[null,'H1: -ve; H2: -ve; H5: -ve; H7: -ve'],	//js (a, c)
							[null,'H1: -ve; H2: -ve; H5: -ve; H7: -ve'],	//kt (a, c)
							[null,'H1: -ve; H2: -ve; H5: -ve; H7: -ve'],	//dl (a, c)
						],
						[	//school 2
							['H1: -ve; H2: -ve; H5: -ve; H7: -ve','H1: -ve; H2: -ve; H5: -ve; H7: -ve'],	//jb (a, c)
							['H1: -ve; H2: -ve; H5: -ve; H7: -ve','H1: -ve; H2: -ve; H5: -ve; H7: -ve'],	//ai (a, c)
							['H1: -ve; H2: -ve; H5: -ve; H7: -ve','H1: -ve; H2: -ve; H5: -ve; H7: -ve'],	//jo (a, c)
						],
					],
					[	//urine
						[	//school 
							[null,'H1: -ve; H2: -ve; H5: -ve; H7: -ve'],	//ja (a, c)
							[null,'H1: -ve; H2: -ve; H5: -ve; H7: -ve'],	//js (a, c)
							[null,'H1: -ve; H2: -ve; H5: -ve; H7: -ve'],	//kt (a, c)
							[null,'H1: -ve; H2: -ve; H5: -ve; H7: -ve'],	//dl (a, c)
						],
						[	//school 2
							['H1: -ve; H2: -ve; H5: -ve; H7: -ve','H1: -ve; H2: -ve; H5: -ve; H7: -ve'],	//jb (a, c)
							['H1: -ve; H2: -ve; H5: -ve; H7: -ve','H1: -ve; H2: -ve; H5: -ve; H7: -ve'],	//ai (a, c)
							['H1: -ve; H2: -ve; H5: -ve; H7: -ve','H1: -ve; H2: -ve; H5: -ve; H7: -ve'],	//jo (a, c)
						],
					],
				],
				[	//qRT-PCRN
					[	//np
						[	//school 
							[null,'N1: -ve; N2: -ve'],	//ja (a, c)
							[null,'N1: -ve; N2: -ve'],	//js (a, c)
							[null,'N1: -ve; N2: -ve'],	//kt (a, c)
							[null,'N1: -ve; N2: -ve'],	//dl (a, c)
						],
						[	//school 2
							['N1: -ve; N2: +ve','N1: -ve; N2: -ve'],	//jb (a, c)
							['N1: -ve; N2: +ve','N1: -ve; N2: -ve'],	//ai (a, c)
							['N1: -ve; N2: +ve','N1: -ve; N2: -ve'],	//jo (a, c)
						],
					],
					[	//blood
						[	//school 
							[null,'N1: -ve; N2: -ve'],	//ja (a, c)
							[null,'N1: -ve; N2: -ve'],	//js (a, c)
							[null,'N1: -ve; N2: -ve'],	//kt (a, c)
							[null,'N1: -ve; N2: -ve'],	//dl (a, c)
						],
						[	//school 2
							['N1: -ve; N2: -ve','N1: -ve; N2: -ve'],	//jb (a, c)
							['N1: -ve; N2: -ve','N1: -ve; N2: -ve'],	//ai (a, c)
							['N1: -ve; N2: -ve','N1: -ve; N2: -ve'],	//jo (a, c)
						],
					],
					[	//csf
						[	//school 
							[null,'N1: -ve; N2: -ve'],	//ja (a, c)
							[null,'N1: -ve; N2: -ve'],	//js (a, c)
							[null,'N1: -ve; N2: -ve'],	//kt (a, c)
							[null,'N1: -ve; N2: -ve'],	//dl (a, c)
						],
						[	//school 2
							['N1: -ve; N2: -ve','N1: -ve; N2: -ve'],	//jb (a, c)
							['N1: -ve; N2: -ve','N1: -ve; N2: -ve'],	//ai (a, c)
							['N1: -ve; N2: -ve','N1: -ve; N2: -ve'],	//jo (a, c)
						],
					],
					[	//urine
						[	//school 
							[null,'N1: -ve; N2: -ve'],	//ja (a, c)
							[null,'N1: -ve; N2: -ve'],	//js (a, c)
							[null,'N1: -ve; N2: -ve'],	//kt (a, c)
							[null,'N1: -ve; N2: -ve'],	//dl (a, c)
						],
						[	//school 2
							['N1: -ve; N2: -ve','N1: -ve; N2: -ve'],	//jb (a, c)
							['N1: -ve; N2: -ve','N1: -ve; N2: -ve'],	//ai (a, c)
							['N1: -ve; N2: -ve','N1: -ve; N2: -ve'],	//jo (a, c)
						],
					],
				],
				[	//ELISA
					[	//np
						[	//school 
							[null,'N1: <1/64; N2: <1/64'],	//ja (a, c)
							[null,'N1: <1/64; N2: <1/64'],	//js (a, c)
							[null,'N1: <1/64; N2: <1/64'],	//kt (a, c)
							[null,'N1: <1/64; N2: <1/64'],	//dl (a, c)
						],
						[	//school 2
							['N1: <1/64; N2: <1/64','N1: <1/64; N2: <1/64'],	//jb (a, c)
							['N1: <1/64; N2: <1/64','N1: <1/64; N2: <1/64'],	//ai (a, c)
							['N1: <1/64; N2: <1/64','N1: <1/64; N2: <1/64'],	//jo (a, c)
						],
					],
					[	//blood
						[	//school 
							[null,'N1: 1/64; N2: 1/1024'],	//ja (a, c)
							[null,'N1: <1/64; N2: 1/512'],	//js (a, c)
							[null,'N1: 1/64; N2: 1/512'],	//kt (a, c)
							[null,'N1: 1/64; N2: 1/1024'],	//dl (a, c)
						],
						[	//school 2
							['N1: 1/64; N2: 1/128','N1: 1/64; N2: 1/1024'],	//jb (a, c)
							['N1: <1/64; N2: 1/64','N1: <1/64; N2: 1/512'],	//ai (a, c)
							['N1: 1/64; N2: 1/64','N1: 1/64; N2: 1/512'],	//jo (a, c)
						],
					],
					[	//csf
						[	//school 
							[null,'N1: <1/64; N2: <1/64'],	//ja (a, c)
							[null,'N1: <1/64; N2: <1/64'],	//js (a, c)
							[null,'N1: <1/64; N2: <1/64'],	//kt (a, c)
							[null,'N1: <1/64; N2: <1/64'],	//dl (a, c)
						],
						[	//school 2
							['N1: <1/64; N2: <1/64','N1: <1/64; N2: <1/64'],	//jb (a, c)
							['N1: <1/64; N2: <1/64','N1: <1/64; N2: <1/64'],	//ai (a, c)
							['N1: <1/64; N2: <1/64','N1: <1/64; N2: <1/64'],	//jo (a, c)
						],
					],
					[	//urine
						[	//school 
							[null,'N1: <1/64; N2: <1/64'],	//ja (a, c)
							[null,'N1: <1/64; N2: <1/64'],	//js (a, c)
							[null,'N1: <1/64; N2: <1/64'],	//kt (a, c)
							[null,'N1: <1/64; N2: <1/64'],	//dl (a, c)
						],
						[	//school 2
							['N1: <1/64; N2: <1/64','N1: <1/64; N2: <1/64'],	//jb (a, c)
							['N1: <1/64; N2: <1/64','N1: <1/64; N2: <1/64'],	//ai (a, c)
							['N1: <1/64; N2: <1/64','N1: <1/64; N2: <1/64'],	//jo (a, c)
						],
					],
				],
			];
			return results;
		}*/
	}
})();