import React from 'react';
import Chart from "react-apexcharts";

const BarGraph = () => {
  const [state, setState] = React.useState({
    options: {
      chart: {
        id: "basic-bar"
      },
      xaxis: {
        categories: ["Openness", "Conscientiousness", "Extraversion", "Agreeableness", "Neuroticism"]
      }
    },
    series: [
      {
        name: "series-1",
        data: []
      }
    ]
  });

  //load big5 result
  React.useEffect(() => {
    document.title = "Result"
    const result = sessionStorage.getItem("Big5Result"); //number[]
    if (result) {
      //parse the result
      const data = JSON.parse(result);
      setState(p => ({...p,
        series: [
          {
            name: "series-1",
            data: data
          }
        ]
      }));
      console.log("Saving data", data);
    } else alert("Please Take the test first");
  }, []);


  return (
    <div>
      <Chart
        options={state.options}
        series={state.series}
        type="bar"
        width="500"
        height="320"
      />
    </div>
  )
}

export default BarGraph
