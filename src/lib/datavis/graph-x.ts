
import type { Dimensions, IGraphConfig, IParameterMapping } from './core/types';
import type { IChartDimensions } from './core/chart-dimensions'
import { ChartObject } from './core/chart-init-objects';
import type { ISvgService } from './core/svg-service';
import { ScaleService } from './core/scale.service';
import { AxesService } from './core/axes.service';
import { SvgService } from './core/svg-service';
import { ChartDimensions } from './core/chart-dimensions';
import * as d3 from 'd3';

export type IGraphControllerX = {

    svgWrapper?: HTMLElement,
    config: IGraphConfig,
    dimensions: Dimensions,
    svg: any,
    chartDimensions : IChartDimensions,
    scales: any;

    init: (data:any) => void,
    _html: (groupEl : HTMLElement) => HTMLElement | undefined,
    prepareData: (data: any) => void,
    draw: (data: any) => Promise<void>,
    redraw: (data?: any, range?: number[]) => Promise<void>
    update: (data: any, update: boolean) => Promise<void>,

}

export class GraphControllerX implements IGraphControllerX  {

  
    config : IGraphConfig;
    graphEl : HTMLElement | undefined = undefined;
    dimensions!: Dimensions;
    svg: any;
    chartDimensions!: IChartDimensions;
    svgService!: ISvgService;
    scales: any;
    axes: any;
    element: HTMLElement | null;
    preparedData: any;


    constructor(
        public elementId: any
    ) {
     
        this.element = d3.select("#" + elementId).node() as HTMLElement | null;
        this.scales = {};
        this.axes = {};
        this.config = { margin: { top: 0, bottom: 0, left: 0, right: 0 }, padding: { top: 0, bottom: 0, left: 0, right: 0 }, scales: [], axes: [], extra: {} }
    }

    init(data: any) {

    }

    _init() {

        let self = this;

        let chartObject = ChartObject();
        this.config = Object.assign(chartObject.config(),this.config);
        this.dimensions = chartObject.dimensions();
        this.svg = chartObject.svg();

        return;
 
    }

    _html (altWrapper?: HTMLElement) {

        // if (this.element == null) return;
    
        // const graphEl = document.createElement('section');
        // graphEl.classList.add("graph-container-12")
        // graphEl.classList.add("graph-view")

        // this.element.appendChild(graphEl);

        return this.element || undefined;
    }

    async _svg(svgWrapper?: HTMLElement) {

        // with elementID we can create a child element as svg container with a fixed height. 
        // this.element = d3.select(svgWrapper ? svgWrapper : this.element).node();
  
        if (this.element == null) return;

        this.chartDimensions = new ChartDimensions(this.element, this.config);
        this.dimensions = this.chartDimensions.measure(this.dimensions);

        this.svgService = new SvgService(this.element, this.config, this.dimensions, this.svg);

        for (let c of this.config.scales) {
            this.scales[c.slug] = new ScaleService(this,c);
        }

        for (let c of this.config.axes) {
            this.axes[c.slug] = new AxesService(this, c);
        }

        return;
    }

    async redraw(data?: any) {

        if (this.svg && this.svg.body == undefined) return;

        this.dimensions = this.chartDimensions.measure(this.dimensions); 
        this.svgService.redraw(this.dimensions);

        if (this.config.scales) {
            for (let c of this.config.scales) {    
                this.scales[c.slug].reset()
            }
        }

        for (let a of this.config.axes) {
            this.axes[a.slug].redraw(this.dimensions,this.scales[a.scale].scale, data.slice)
        }

        return;
    }

    async draw(data: any) : Promise<void> {
        return;
    }


    prepareData(data: any) : any{
        return data;
    }

    async update(data: any, update: boolean) {
        return;
    }

    async _update(newData: any, update: boolean) {

        let self = this;

        if (update && this.config.extra.noUpdate) { return; }
                
        const data = self.prepareData(newData);
        // //  needed within multiples .. why ??? 
       // this.preparedData = Object.assign({}, data);

        await self.draw(data);
        await self.redraw(data);
        window.addEventListener("resize", () => self.redraw(data), false);

        return;
    }

    _addScale(slug: string, type: string, direction: string, parameter?: string) {

        this.config.scales.push({
            slug,
            type,
            direction,
            parameter
        })
    }

    _addAxis(slug: string, scale: string, position: string, format?: string, extra?: string, label?: string) {

        this.config.axes.push({
            slug,
            scale,
            position,
            format,
            extra,
            label
        })
    }

    _addMargin(top: number,bottom: number,left: number,right: number) {

        this.config.margin = {
            top,
            bottom,
            left,
            right
        }
    }

    _addPadding(top: number,bottom: number,left: number,right: number) {

        this.config.padding = {
            top,
            bottom,
            left,
            right
        }
    }
}