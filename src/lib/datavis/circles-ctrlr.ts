import { BallenbakSimulationV2 } from "./ballenbak.simulation-v2";
import { ChartCircles } from "./circles-chart";
import { GraphControllerX } from "./graph-x";


export class CirclesV1 extends GraphControllerX  {

    circleGroups: any;
    simulation: any;

    constructor(
        public elementId:  string,
    ){
        super(elementId) 
        this.pre();
    }

    pre() {

        this._addMargin(0,0,0,0);
        this._addPadding(0,0,0,0);

        this._addScale('x','band','horizontal','value');
        this._addScale('y','band','vertical-reverse','value');
        this._addScale('r','linear','radius','value');
    }

    html() {

        this.graphEl = super._html();
    } 

    async init(data:any) {

        const self = this;
        await super._init();
        if (this.graphEl != null) super._svg(this.graphEl);

        this.config.minRadius = 20;
        this.config.radiusFactor = .66;
        this.config.paddingInner = 0;
        this.config.paddingOuter = 0;

        this.circleGroups = new ChartCircles(this);

        this.update(data,false);

        return;
    }

    prepareData(data: any): any {

        console.log(data);

        for (const token of data) {

            token['name'] = token.address;
            token['balance'] = token.balance;   
            token['radius'] = token.radius ||token.balance;
        }

      return data;
    }

    async draw(data: any) {

        let values = [0];
        // for (const year of data) {
        //     values = values.concat(year.group.map( (p: any) => p.value))
        // }

      //  console.log(data);

        this.scales.x.set(data.map( (d: any) => d['name']));
        this.scales.y.set(data.map( (d: any) => d['name']));
        this.scales.r.set(data.map( (d: any) => d['radius'])); 
        
        this.circleGroups.draw(data);

        this.simulation = new BallenbakSimulationV2(this);
        this.simulation.supply(data)
    
    }


    async redraw(data: any) {
    
        await super.redraw(data);
        // redraw data
        this.circleGroups.redraw(this.dimensions);
        this.simulation.redraw(data.length)
    }

    async reposition(data: any) {

        this.simulation = new BallenbakSimulationV2(this);
        this.simulation.supply(data)
        this.simulation.redraw(data.length)
    }

    
    async update(data: any, update: boolean) {

        await super._update(data, update);
        
     } 
}
