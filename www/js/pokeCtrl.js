var app = angular.module("pokeApp", ['ionic']);
var current_id = 1;
var current_poke="bulbasaur";
var suggestions=[];
var description;
var type_url = [];
app.controller("pokeCtrl", function($scope) {
	$scope.pokemon_list = [];

	// Put all pokemon into a list
	getAllPokemon();

	$scope.poke_abilities = [];
	var egg_groups_list;
	var global_egg_list=[];
	var global_types=[];
	var PieChart;
	
	var ctx = document.getElementById("pokeStats");
	PieChart = new Chart(ctx, {
    data: [1,2,3],
    type: "doughnut",
	    options: {
	        elements: {
	            arc: {
	                borderColor: "white"
	            }
	        }
	    }
	});

	$scope.nextPokemon = function(){
		if(current_id<$scope.pokemon_list.length)
			$scope.getPokemonObject(current_id+1);
	}
	$scope.prevPokemon = function(){
		console.log("prev");
		if(current_id>1)
			$scope.getPokemonObject(current_id-1);
		
	}
	$scope.prevPokemon = function(){
		console.log("prev");
		if(current_id>1)
			$scope.getPokemonObject(current_id-1);	
	}
	$scope.showMates = function(){
		Materialize.toast('Loading Pokemon: ');
		global_egg_list=[];
		for(var i=0; i<egg_groups_list.length; i++){
			var url = egg_groups_list[i].url;
			
			$.when(getPokeFromEggGroup(url)).done(function(){
				
			});
		}
	}
	$scope.displayType = function(num){

		Materialize.toast('Loading damage calculator...');
		var url, type;
		if(num==0){
			url = type_url[0];
			type = $('#type1').text();
		}
		else{
			url = type_url[1];
			type = $('#type2').text();
		}
		$.getJSON(url, function(data) {
			
			var damage = data.damage_relations;
			var double_dmg_from = dmgList(damage.double_damage_from);
			var double_dmg_to = dmgList(damage.double_damage_to);
			var half_dmg_from = dmgList(damage.half_damage_from);
			var half_dmg_to= dmgList(damage.half_damage_to);
			var no_dmg_from=dmgList(damage.no_damage_from);
			var no_dmg_to=dmgList(damage.no_damage_to);

			var text="";
			text+="(2x) damage from: "+listToString(double_dmg_from) +"\n";
			text+="(0.5x) damage from: "+listToString(half_dmg_from)+"\n";
			text+="(0x) damage from: "+listToString(no_dmg_from)+"\n\n";
			text+="(2x) damage to: "+listToString(double_dmg_to)+"\n";
			text+="(0.5x) damage to: "+listToString(half_dmg_to)+"\n";
			text+="(0x) damage to: "+listToString(no_dmg_to)+"\n";
			swal(capitalize(type),text);
			$('.toast').fadeOut();
		});
	}

	function dmgList(object){
		var tmp_list =[];
		for(var i=0; i<object.length; i++)
			tmp_list.push(capitalize(object[i].name));
		return tmp_list;
	}

	function getPokeFromEggGroup(url){
		$.getJSON(url, function(data) {
			//global_egg_list
			console.log(data);
			var pokemon_species = data.pokemon_species;
			for(var i=0; i<pokemon_species.length; i++){
				var id = getIdFromUrl(pokemon_species[i].url,"pokemon-species")
				if(id<151)
					global_egg_list.push(capitalize(pokemon_species[i].name));
			}
			var text = "";
			for(var j=0; j<global_egg_list.length; j++){
				text+=global_egg_list[j];
				if(j<global_egg_list.length-1)
					text+=", ";
			}
			if(data.name !="no-eggs")
				swal("Able to breed with: ",text);
			else
				swal("","This Pokemon is unable to breed.");
			$('.toast').fadeOut();
		});
	}
	// Gets Pokemon object, fills out html
	$scope.getPokemonObject= function(number, pokename){
		console.log("loading...");
		current_id = number;
		var full = "http://pokeapi.co/api/v2/pokemon/"+number;

		var pokename = getNameFromId(number);
		if(pokename!=null)
			Materialize.toast('Loading stats for '+capitalize(pokename)+'...');

		global_egg_list=[];
		$.getJSON(full, function(data) {
			
			PieChart.destroy();
			var pokemon = data;
			console.log(pokemon);

			current_poke = pokemon.name;
			$('#pokename').html("[#"+number+"] "+capitalize(pokemon.name));

			$scope.$apply(function() {
    			$scope.poke_abilities = [];
				for(var i=pokemon.abilities.length-1; i>=0; i--){
					var hidden = pokemon.abilities[i].is_hidden;
					var color;
					if(hidden)
						color="blue-grey darken-3 white-text";
					else
						color="blue-grey lighten-4 black-text";

					$scope.poke_abilities.push({
						'name': pokemon.abilities[i].ability.name,
						'url': pokemon.abilities[i].ability.url,
						'color': color,
						'isHidden': hidden});
				}
			});

			var abilities = returnAbilities(pokemon.abilities);
			var types = returnTypes(pokemon.types);

			type_url=[];
			for(var z=0; z<pokemon.types.length; z++)
				type_url.push(pokemon.types[z].type.url);

			var stats= returnStats(pokemon.stats);

			showStats(stats);

			var statsType= ["Speed","Sp. Def", "Sp. Atk","Defense","Attack","HP"];
			// Combine the arrays
			var list = [];
			for (var j=0; j<statsType.length; j++)
				list.push({'name':statsType[j], 'num':stats[j]});

			// Sort
			list.sort(function(a,b){
				return b.num- a.num;
			});

			suggestions=[];
			for(var k=0; k<3; k++)
				pushSuggestions(k,list, stats);

			$('#best_stats').text(list[0].name+" , "+list[1].name+" , "+list[2].name);
			//$('#abilities').html(listToString(abilities));

			global_types = types;
			$('#type1').html(types[0]);
			$('#type1').attr("class", ("btn black-text waves-effect waves-light "+returnColor(types[0])));
			if(types.length>1){
				$('#type2').show();
				$('#type2').html(types[1]);
				$('#type2').attr("class", ("btn black-text waves-effect waves-light "+returnColor(types[1])));
			}
			else
				$('#type2').hide();
			
			// Get Pokemon Species info
			getPokemonSpecies(number);

			$('#pokepic').attr("src", ("img/official-artwork/"+number+".png"));
			
			$('#pokecontent').attr("class", ("modal-content "+returnColor(types[0])));
			$('.modal').modal();
		});
	}

	function capitalize(string) 
	{
    	return string.charAt(0).toUpperCase() + string.slice(1);
	}

	// Gets all of the pokemon from a pokedex request
	function getAllPokemon(){
		var toast = Materialize.toast('Loading all Pokemon...');
		var full = "http://pokeapi.co/api/v2/pokedex/1/";
		$.getJSON(full, function(response) {
			
			console.log(response);
			var pokedex_list= (response.pokemon_entries);
			var pokemon_names = [];
			var pokemon_id = [];

			for(var i=0; i<pokedex_list.length; i++)
			{
				var id = pokedex_list[i].entry_number;
				var name = pokedex_list[i].pokemon_species.name;
				if(parseInt(id)<=151){
					pokemon_names.push(name);
					pokemon_id.push(id);
				}
			}

			// Combine the arrays
			for (var j=0; j<pokemon_names.length; j++)
				$scope.pokemon_list.push({'name':pokemon_names[j], 'id':pokemon_id[j]});

			// Sort
			$scope.pokemon_list.sort(function(a,b){
				return a.id- b.id;
			});

			// Seperate them back out:
			for (var k=0; k<$scope.pokemon_list.length; k++){
				pokemon_names[k] = $scope.pokemon_list[k].name;
				pokemon_id[k] = $scope.pokemon_list[k].id;
			}

			$('.toast').fadeOut();
			 
		});	
	}

	// Display ability given url
	$scope.displayAbility = function(ability){
		Materialize.toast('Loading Ability: '+capitalize(ability.name));
		var url = ability.url;
		console.log(ability);
		$.getJSON(url, function(response) {
			var name = response.names[2].name;
			console.log(response);
			var effect = response.effect_entries[0].effect;
			//swal(url);
			var hidden = ability.isHidden;
			var text ="";
			if(hidden)
				text_hidden="(Hidden ability)\n\n"+effect;
			else
				text_hidden = effect;
			swal(name, text_hidden);
			$('.toast').fadeOut();
		});	
	}

	// Returns a Materiliaze color to be used
	function returnColor(type){
		var color;
		type = type.toLowerCase();
		if(type=="normal")
			color = "grey lighten-4";
		else if(type=="flying")
			color = "indigo lighten-4";
		else if(type=="fire")
			color = "deep-orange accent-1";
		else if(type=="water")
			color = "light-blue lighten-3";
		else if(type=="grass")
			color = "light-green lighten-2";
		else if(type=="fighting")
			color = "red lighten-2";
		else if(type=="poison")
			color = "purple lighten-3";
		else if(type=="electric")
			color = "yellow lighten-3";
		else if(type=="ground")
			color = "brown lighten-2";
		else if(type=="rock")
			color = "brown lighten-4";
		else if(type=="psychic")
			color = "deep-purple lighten-3";
		else if(type=="ice")
			color = "blue lighten-5";
		else if(type=="bug")
			color = "lime lighten-3";
		else if(type=="dragon")
			color = "deep-purple accent-1";
		else if(type=="ghost")
			color = "deep-purple lighten-2";
		else if(type=="dark")
			color = "grey darken-1";
		else if(type=="fairy")
			color = "pink lighten-4";
		else if(type=="steel")
			color = "blue-grey lighten-2";

		return color;
	}

	function returnAbilities(poke_abil){
		var list = [];
		for(var i=0; i< poke_abil.length; i++){
			list.push(capitalize(poke_abil[i].ability.name));
		}
		return list;
	}
	function returnTypes(poke_types){
		var list = [];
		for(var i=0; i< poke_types.length; i++){
			list.push(capitalize(poke_types[i].type.name));
		}
		return list;
	}
	function returnList(pokething){
		var list = [];
		for(var i=0; i< pokething.length; i++){
			list.push(capitalize(pokething[i].name));
		}
		return list;
	}

	function returnStats(pokemon_stats){
		var list = [];

		// Speed, Sp Def, Sp Atk, Def, Atk, Hp, Total
		var speed = pokemon_stats[0].base_stat;
		var spDef = pokemon_stats[1].base_stat;
		var spAtk = pokemon_stats[2].base_stat;
		var defense = pokemon_stats[3].base_stat;
		var attack = pokemon_stats[4].base_stat;
		var hp = pokemon_stats[5].base_stat;
		//var total = speed+spDef+spAtk+defense+attack;

		list.push(speed);
		list.push(spDef);
		list.push(spAtk);
		list.push(defense);
		list.push(attack);
		list.push(hp);
		//list.push(total);

		return list;
	}

	// Figure out egg group and gender
	function getPokemonSpecies(id)
	{
		var full = "http://pokeapi.co/api/v2/pokemon-species/"+id;
		$.getJSON(full, function(data) { //jquery shorthhand of
			//return data;
			//console.log(data);
			var pokemon = data;

			console.log(pokemon);
			description = (pokemon.flavor_text_entries[1].flavor_text);
			var egg_group = returnList(data.egg_groups);
			egg_groups_list = data.egg_groups;

			$('#egg_groups').html(listToString(egg_group));

			var genera = pokemon.genera[2].genus;
			$('#genera').html("The "+genera);
			$('#pokechip').attr("src", ("img/pokemon/"+id+".png"));
			var genderFemale = ((parseFloat(data.gender_rate)/8.0) * 100);
			var femaleString = genderFemale.toString() +"%";

			if(genderFemale>=0){
				var genderMale = 100.0-genderFemale;
				var maleString = genderMale.toString()+"%";
				var genderString = maleString+" ♂ , "+femaleString+" ♀";
				$('.progress').css('background-color', '#ffb4d9');
				$('#gender').html((genderString));
				$("#gender_bar").width(maleString);
				
			}
			else{
				$('.progress').css('background-color', '#B8B8B8');
				$('#gender').html("No gender ⚲");
				$("#gender_bar").width("0%");
			}
			
			var evo_chain = pokemon.evolution_chain.url;
			fetchEvo(evo_chain);
   		 });
	}
	function fetchEvo(url)
	{
		var full = url;
		$.getJSON(full, function(data) { //jquery shorthhand of
			//return data;
			var pokemon = data;
			var chain = pokemon.chain;
			
			var evo_chain = [];
			console.log(chain);

			$('.toast').fadeOut();

			
			if(getIdFromUrl(chain.species.url,"pokemon-species")<$scope.pokemon_list.length){
				evo_chain.push({'name': capitalize(chain.species.name),
					'id': getIdFromUrl(chain.species.url,"pokemon-species"),
					'type': ""});
			}

			if(chain.evolves_to.length >0){
				var evolves_into = chain.evolves_to[0];
				var details = evolves_into.evolution_details[0];
				var evolve_type;
				if(details.trigger.name=="level-up")
					if(details.min_level!=null)
						evolve_type = "→lvl. "+details.min_level + "→";
				else{

					evolve_type = capitalize(details.item.name);
				}

				evo_chain.push({'name': capitalize(evolves_into.species.name),
					'id': getIdFromUrl(evolves_into.species.url,"pokemon-species"),
					'type': evolve_type});
				if(evolves_into.evolves_to.length>0){
					var last_evolve = evolves_into.evolves_to[0];
					var details = last_evolve.evolution_details[0];
					var evolve_type;
					if(details.trigger.name=="level-up"){
						if(details.min_level!=null)
							evolve_type = "→lvl. "+details.min_level + "→";
					
					}
					else{
						evolve_type = "→" + capitalize(details.item.name) + "→";
					}

					evo_chain.push({'name': capitalize(last_evolve.species.name),
					'id': getIdFromUrl(last_evolve.species.url,"pokemon-species"),
					'type': evolve_type});
				}
			}

			var evo_string ="";
			for(var i=0; i<evo_chain.length; i++){
				
				evo_string += evo_chain[i].type +" " + 
				` <img class="evoImg" src="img/pokemon/${evo_chain[i].id}.png"> `;
			}
			$('#evo').html(evo_string);

			
			//console.log(evo_chain);
    	});
	}

	function getIdFromUrl(url,searchTerm){
		var index = url.indexOf(searchTerm)+searchTerm.length;
		var id = url.slice(index+1,url.length-1);
		return parseInt(id);
	}
	function listToString(list){
		var string="";
		for(var i=0; i< list.length; i++){
			string+=list[i];
			if(i!= list.length-1)
				string+=" / ";
		}
		return string;
	}
	function getNameFromId(id){
		return $scope.pokemon_list[id-1].name;
	}

	function pushSuggestions(n, ordered, stats)
    {
    	var statsType= ["Speed","Sp. Def", "Sp. Atk","Defense","Attack","HP"];

      // Attack
      if(ordered[n].name == "Attack"){
      	if(stats[4]-stats[2]>6)
          suggestions.push("Adamant");
        if(stats[4]-stats[2]<6 || 
          stats[4]-stats[0]>6)
          suggestions.push("Brave");
      }
      // Defense
      else if(ordered[n].name == "Defense"){
         if(stats[3]-stats[4]>6)
          suggestions.push("Bold");
        if(stats[3]-stats[2]>6)
          suggestions.push("Impish");
        if(stats[4]-stats[0]>6)
          suggestions.push("Relaxed");
      }
      // Sp Attack
      else if(ordered[n].name == "Sp. Atk"){
        if(stats[2]-stats[4]>6)
          suggestions.push("Modest");
        if(stats[2]-stats[4]<6 ||
          stats[2]-stats[0]>6)
          suggestions.push("Quiet");
      }
      // Sp Defense
      else if(ordered[n].name == "Sp. Def"){
      	if(stats[1]-stats[4]>6)
          suggestions.push("Calm");
        if(stats[1]-stats[2]>6)
          suggestions.push("Careful");
        if(stats[1]-stats[0]>6)
          suggestions.push("Sassy");
      }
      // Speed
      else if(ordered[n].name == "Speed"){
        if(stats[0]-stats[2]>6)
          suggestions.push("Jolly");
        if(stats[0]-stats[4]>6)
          suggestions.push("Timid");
      }
    }
	function showStats(list){

		var ctx = document.getElementById("pokeStats");
		var data = {
		    datasets: [{
		        data: list,
		        backgroundColor: [
		            "#FF6384",
		            "#4BC0C0",
		            "#FFCE56",
		            "#E7E9ED",
		            "#36A2EB",
		            "#7e57c2"
		        ],
		        label: 'My dataset' // for legend
		    }],
		    labels: ["Speed","Sp. Def", "Sp. Atk","Defense","Attack","HP"],
		};

	 PieChart = new Chart(ctx, {
	    data: data,
	    type: "polarArea",
	    options: {
	        elements: {
	            arc: {
	                borderColor: "white"
	            }
	        }
	    }
		});
	}

});