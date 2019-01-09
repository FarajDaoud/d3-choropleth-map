import './index.css';
import * as d3 from 'd3';
import * as topojson from 'topojson';
import * as d3Legend from 'd3-svg-legend';

//Add event listner On page load
document.addEventListener('DOMContentLoaded', function(){
    let eduURL = 'https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/for_user_education.json';
    let countyURL = 'https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/counties.json';
    fetch(eduURL)
    .then(handleResponse)
    .then((eduData) => {
        fetch(countyURL)
        .then(handleResponse)
        .then((countyData) => {
            //Data loaded correctly
            createChoroplethMap(eduData, countyData);
        })
        .catch(error => console.error(error));
    })
    .catch(error => console.error(error));
});

function handleResponse(response) {
    if(response.ok) return response.json();
    throw new Error(response.message);
}

function createChoroplethMap(eduData, countyData){
    let mapWidth = 1100
    ,mapHeight = 800
    ,path = d3.geoPath();

    let svg = d3.select('#choroplethMap')
        .append('svg')
        .attr('width', mapWidth)
        .attr('height', mapHeight);

    let colorScale = d3.scaleThreshold()
        .domain(d3.range(2.6, 75.1, (75.1-2.6)/8))
        .range(d3.schemeReds[9]);

    let tooltip = d3.select('#choroplethMap')
        .append('div')
        .attr('id', 'tooltip')
        .style('opacity', 0);

    //create US Map
    svg.append('g')
        .attr('class', 'countyContainer')
        .selectAll('path')
        .data(topojson.feature(countyData, countyData.objects.counties).features)
        .enter().append('path')
        .attr('class', 'county')
        //set attribute data-fips
        .attr('data-fips', (d) => d.id)
        //set attribute data-education
        .attr('data-education', (d) => {
            let result = eduData.filter((obj) => obj.fips === d.id);
            return result[0].bachelorsOrHigher ? result[0].bachelorsOrHigher : 0;
        })
        //set county fill color
        .attr('fill', (d) => {
            let result = eduData.filter((obj) => obj.fips === d.id)
            return result[0] ? colorScale(result[0].bachelorsOrHigher) : colorScale(0);
        })
        //set attribute d to the county geoPath
        .attr('d', path)
        .on('mouseover', (d) => {
            tooltip.style('opacity', 9.5)
            .html(() => {
                let result = eduData.filter((obj) => obj.fips === d.id);
                return result[0] ? `State: ${result[0].state}<br>
                    ${result[0].area_name}<br>
                    Percent: ${result[0].bachelorsOrHigher}%`
                    : '';
            })
            //set attribute data-education
            .attr('data-education', () => {
                let result = eduData.filter((obj) => obj.fips === d.id);
                return result[0].bachelorsOrHigher ? result[0].bachelorsOrHigher : 0;
            })
            .style('z-index', 2)
            .style('left', (d3.event.pageX - 380) + 'px')
            .style('top', (d3.event.pageY - 500) + 'px')
        })
        .on('mouseout', () => {
            tooltip.style('opacity', 0)
            .style('z-index', -2)
        });

       //create legendScale    
       let legendScale = d3.scaleQuantile()
       .domain(eduData.map((d) => d.bachelorsOrHigher))
       .range(colorScale.range());

       
        //create legend element
        let legend = d3Legend.legendColor()
        .shapeWidth(25)
        .scale(legendScale);

        svg.append('g')
            .attr('class', 'legend')
            .attr('id', 'legend')
            .attr('transform', `translate(900,250)`);

        svg.select('.legend')
            .call(legend);


}