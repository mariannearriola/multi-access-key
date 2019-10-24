simplifiedKey :-

	domain(archaea).
	domain(bacteria).
	domain(eukarya).

	kingdom(archaebacteria).
	kingdom(protista).
	kingdom(fungi).
	kingdom(plantae).
	kingdom(animalia).
	kingdom(eubacteria).

	phylum(euryarchaeota).
	phylum(crenarchaeota).
	phylum(korachaeota).
	phylum(ciliate).
	phylum(dinoflagellates).
	phylum(forams).
	phylum(amoebozoa).
	phylum(moss).
	phylum(arthropod).
	phylum(cyanobacteria).
	


	
	member(archaea,archaebacteria).
	member(eukarya,protista).
	member(eukarya,fungi).
	member(eukarya,plantae).
	member(eukarya,animalia).
	member(bacteria,eubacteria).

	member(archaebacteria,euryarchaeota).
	member(archaebacteria,crenarchaeota).
	member(archaebacteria,korachaeota).
	member(protista,cilitae).
	member(protista,dinoflagellates).
	member(protista,forams).
	member(fungi,amoebozoa).
	member(plantae,moss).
	member(animalia,arthropod).
	member(eubacteria,cyanobacteria).

	is_member_of(T1,T2):-
		member(T1,T2).
	is_member_of(T1,T2):-
		member(T1,X),
		is_member_of(X,T2).