import type { SimulationNodeDatum } from "d3";
import * as d3 from "d3";

const forceStrength = 0.125;

export class BallenbakSimulationV2 {

    s: any;

    constructor(private ctrlr: any) {
        this.init()
    }

    init() {
 
        if (this.s) {
            this.s = null;
        }
    

        this.s = d3.forceSimulation();
        
        this.s
         //   .force('charge', d3.forceManyBody().strength(forceStrength))
            .force("center", d3.forceCenter())
            .force("collide", d3.forceCollide().strength(forceStrength));
    }

    supply(data: any) {

        let self = this;
                    
        this.s   
            .nodes(data as SimulationNodeDatum[]);

        this.s 
            .on("tick", (d: any) => {

                self.ctrlr.circleGroups.forceDirect()
            }); 
    }

    restart() {
    
        this.s.alphaTarget(.3).restart();
    }

    redraw() {

        let groupWidth = this.ctrlr.dimensions.width;
        let center = {x: (groupWidth / 2) , y: ((this.ctrlr.dimensions.height / 2)) };

        this.s 
            .force("center")
                .x(center.x)
                .y(center.y);
            
        this.s    
            .force("collide")
                .radius((d : any) => {                     
                    return this.ctrlr.scales.r.fn(d.radius) + 0
            });

        this.s.alpha(.3).restart();
    }

}