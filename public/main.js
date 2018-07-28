window.onload = function() {

var pollData ={pollData}
console.log(pollData)
var chart = new CanvasJS.Chart("chartContainer", {
    animationEnabled: true,
    title: {
        text: "GROUP 3"
    },
    data: [{
        type: "pie",
        startAngle: 240,
        // yValueFormatString: "##0.00\"%\"",
        indexLabel: "{label} ",
        dataPoints: [
            {y: 2, label: "IGNITE"},
            {y: 4, label: "Oikos"},
            {y: 6, label: "Student Impact"},
        ]
    }]
});
chart.render();


}
