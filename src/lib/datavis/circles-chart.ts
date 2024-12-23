import * as d3 from 'd3';
import { slugify } from '$lib/factory/utils.factory';
import { select as d3Select } from 'd3-selection';
import { transition as d3Transition } from 'd3-transition';
d3Select.prototype.transition = d3Transition;

export class ChartCircles {

    start = {};

    headerGroup: any;
    headerGroupEnter: any;
    headerLabels: any;

    group: any;
    groupEnter: any;

    headers_lines: any;

    circles: any;
    circlesLabel: any;
    circlesAmount: any;

    tooltipArray :  string[] = [];
    hovering: boolean = false;
    data!: any[];


    constructor(
        private ctrlr: any
    ) {

    }


    draw(data: any) {

        this.data  = data;

        let self = this;

//         this.ctrlr.svg.defs.

//         <defs>
//     <filter id="drop-shadow" x="-50%" y="-50%" width="200%" height="200%">
//       <feDropShadow dx="5" dy="5" stdDeviation="3" flood-color="rgba(0, 0, 0, 0.5)" />
//     </filter>
//   </defs>

        this.group = this.ctrlr.svg.layers.data.selectAll('.group')
            .data(data, (d:any) => slugify(d.name))
            .join("g")
            .attr("class","group");

        this.group.selectAll('circle').remove();
        this.group.selectAll('text').remove();

        this.circles = this.group
          
            .append("circle")
            .attr("class","circle")
            .style("stroke", (d: any, i:number) => {  return "white" })
            .style("fill", (d: any, i:number) => { return "white" });

        this.circlesLabel = this.group
            .append("text")
            .attr("class","small-label in-circle")
            .attr("text-anchor","middle")
            .style("font-size","1rem")
            .style("fill","black");

        this.circlesAmount = this.group
            .append("text")
            .attr("class","small-label in-circle")
            .attr("text-anchor","middle")
            .style("font-size","1rem")
            .style("fill","black");
    }

    redraw() {

        let self = this;

        this.circles
            .attr("r", (d: any) => this.ctrlr.scales.r.scale(d.balance))
            .on("click",  (event: any, dd: any) => {

                // console.log(event, d)

                for (const token of this.data) {
                    token.radius = token.balance;
                    // token.vx = 0;
                    // token.vy = 0;
                    token.x = 0;
                    token.y = 0;
                    
                    if (dd.address == token.address) {
                        token.radius = 900;
                    }
                }

                this.circles.attr("r", (d: any) => {
                    d.radius = d.balance;
                    return this.ctrlr.scales.r.scale(d.radius)
                });

                dd.radius = 900; 

                d3.select(event.target).transition()
                .duration(500)
                .attr("r", (d: any) => this.ctrlr.scales.r.scale(d.radius));

                // this.ctrlr.simulation.init();
               // this.ctrlr.simulation.supply(this.data);
                this.ctrlr.simulation.redraw();
                this.ctrlr.redraw(this.data)
            });

            //     self.hovering = true;

        

            //     // detect if is hovering the element 
            //     // unless 

            //     if(!this.hovering) {

            //         let html = `
        
            //             <div>` + d.meta.def_nl +  `</div>
            //             <div>GFS code:` + d.meta.code +  `</div>
            //             <div>Bedrag: &euro;` + thousands(d.value) + `</div>
            //         `;

            //         window.d3.select('.tooltip')
            //             .html(html)
            //             .style("left", (event.pageX + 5) + "px")
            //             .style("top", (event.pageY - 5) + "px")
            //             .style("opacity", 1);

            //         self.tooltipArray.push(d.label);
            //     }
                
            // })
            // .on("mouseout", function (event, d) {

               
            //     // only if has not immediately entered a new one 



            //     // detect rer-entry!

            //     // const index = self.tooltipArray.indexOf(d.label);
                
            //     // if (index > -1) {
            //     //    self.tooltipArray.splice(index,1)
            //     // }

            //     // setTimeout( () => {

            //     //         if(self.tooltipArray.length == 0) {
            //     //             window.d3.select('.tooltip')
            //     //                 .transition()
            //     //                 .duration(250)
            //     //                 .style("opacity", 0);
            //     //         }

            //     //     },250);
            // });

        this.circlesLabel
            .attr("dy", () => -12)
            .attr("pointer-events","none")
            .text( (d: any) => { 

                if (this.ctrlr.scales.r.fn(d.radius) > 60) {
                    return d.profileSymbol
                }
            });

        this.circlesAmount
            .attr("dy", (d: any) => {
                
                if (this.ctrlr.scales.r.fn(d.radius) > 60) {
                    return 12
                } else {
                    return 6;
                }
             
            
            })
            .attr("pointer-events","none")
            .html( (d: any) => { 

            return Math.round(d.balance)
        });
    }

    forceDirect() {

        let self = this;

        this.group
            .attr("transform", (d: any) => {

                if(d.x !== undefined) {
                    return "translate(" + d.x + "," + (d.y + 0) + ")";
                }
            })
        ;
    }
}
