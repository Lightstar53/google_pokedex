$(document).ready(function () {
    swal("Welcome!", "Try typing in a Pokemon name to get started.");
    $('.modal').modal({
        dismissible: true, // Modal can be dismissed by clicking outside of the modal
        opacity: .5, // Opacity of modal background
        inDuration: 300, // Transition in duration
        outDuration: 200, // Transition out duration
        startingTop: '4%', // Starting top style attribute
        endingTop: '10%' // Ending top style attribute
    });
})

function goTop() {
    $("html, body").animate({
        scrollTop: 0
    }, 'slow');
    console.log("top");
    return false;
}

function goBottom() {
    $("html, body").animate({
        scrollTop: $(document).height()
    }, 'slow');
    console.log("bottom");
    return false;
}

function topStats() {
    console.log("top");
    var text = "";
    for (var i = 0; i < suggestions.length; i++) {
        text += getStringNature(suggestions[i]);
    if (i == 2)
        break;
    if (i < suggestions.length - 1)
        text += "\n";
    }
    swal("Suggested natures:", text);
}

var l_name = "Adamant Bashful Bold Brave Calm Careful Docile Gentle Hardy Hasty Impish Jolly Lax Lonely Mild Modest Naive Naughty Quiet Quirky Rash Relaxed Sassy Serious Timid".split(" ");
var l_increases = "Attack Sp.Attack Defense Attack Sp.Defense Sp.Defense Defense Sp.Defense Attack Speed Defense Speed Defense Attack Sp.Attack Sp.Attack Speed Attack Sp.Attack Sp.Defense Sp.Attack Defense Sp.Defense Speed Speed".split(" ");
var l_decreases = "Sp.Attack Sp.Attack Attack Speed Attack Sp.Attack Defense Defense Attack Defense Sp.Attack Sp.Attack Sp.Defense Defense Defense Attack Sp.Defense Sp.Defense Speed Sp.Defense Sp.Defense Speed Speed Speed Attack".split(" ");

function getStringNature(nature) {
    var index = l_name.indexOf(nature);
    var text = nature + " (" + "↑ " + l_increases[index] + " ↓ " + l_decreases[index] + ")";
    return text;
}

function showDescription() {
    swal("Description", description);
}

function helpStats() {
    var text = "";
    for (var i = 0; i < l_name.length; i++)
        text += getStringNature(l_name[i]) + "\n";
    swal("Natures", text);
}
