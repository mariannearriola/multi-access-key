aSimpleDichotomousKey :- identify.

identify:-
	retractall(known(_,_,_)),
	phylum(X),
	write('The species is in '),write(X),nl.
identify:-
	write('idk'),nl.

phylum([cyanobacteria,proteobacteria]):-
	domain(bacteria),
	kingdom(eubacteria).
phylum(forams):-
	domain(eukarya),
	kingdom(protista).
phylum(moss):-
	domain(eukarya),
	kingdom(plantae).

	domain(X):- ask(domain,X).
	kingdom(X):- ask(kingdom,X).

	ask(Attribute,Value):-
		known(yes,Attribute,Value),
		!.
	ask(Attribute,Value):-
		known(_,Attribute,Value),
		!, fail.
	ask(Attribute,_):-
		known(yes,Attribute,_),
		!, fail.
	ask(A,V):-
 		write(A:V),                     
  		write('? (yes or no): '),
  		read(Y),                       
  		asserta(known(Y,A,V)),           
  		Y = yes.    

	menuask(Attribute,Value,_):-
		known(yes,Attribute,Value),
		!.
	menuask(Attribute,_,_):-
		known(yes,Attribute,_),
		!, fail.
	menuask(Attribute,AskValue,Menu):-
		nl,write('What is the value for '),write(Attribute),write('?'),nl,
		display_menu(Menu),
		write('Enter the number of choice> '),
		read(Num),nl,
		pick_menu(Num,AnswerValue,Menu),
		asserta(known(yes,Attribute,AnswerValue)),
		AskValue = AnswerValue.
	display_menu(Menu):-
		disp_menu(1,Menu), !.
	disp_menu(_,[]).
	disp_menu(N,[Item | Rest]):-
		write(N),write(' : '),write(Item),nl,
		NN is N + 1,
		disp_menu(NN,Rest).

	pick_menu(N,Val,Menu):-
		integer(N),
		pic_menu(1,N,Val,Menu), !.
		pick_menu(Val,Val,_).
	pic_menu(_,_,none_of_the_above,[]).
	pic_menu(N,N,Item,[Item|_]).
	pic_menu(Ctr,N,Val,[_|Rest]):-
		NextCtr is Ctr + 1,
		pic_menu(NextCtr,N,Val,Rest).	