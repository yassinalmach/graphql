import { executeQuery } from "./api.js";
import { XP_PROGRESS_QUERY } from "./queries.js";
import { formatXP } from "./utils.js";

export class XPLineChart {
    constructor(container) {
        this.container = container;
        this.margin = { top: 20, right: 40, bottom: 30, left: 80 };
        this.width = container.clientWidth - this.margin.left - this.margin.right;
        this.height = 600 - this.margin.top - this.margin.bottom;
    }

    async initialize() {
        try {
            const data = await this.fetchData();
            if (!data || data.length === 0) return;
            
            this.createSVG();
            this.processData(data);
            this.createScales();
            this.drawAxes();
            this.drawLine();
            this.drawPoints();
            this.setupTooltip();
        } catch (error) {
            console.error('Error initializing chart:', error);
            this.container.innerHTML = '<p class="error-message">Error loading chart data</p>';
        }
    }

    async fetchData() {
        const response = await executeQuery(XP_PROGRESS_QUERY);
        return response.transaction;
    }

    createSVG() {
        this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        this.svg.setAttribute("viewBox", `0 0 ${this.width + this.margin.left + this.margin.right} ${this.height + this.margin.top + this.margin.bottom}`);
        this.svg.style.width = "100%";
        this.svg.style.height = "100%";
        
        this.g = document.createElementNS("http://www.w3.org/2000/svg", "g");
        this.g.setAttribute("transform", `translate(${this.margin.left},${this.margin.top})`);
        
        this.svg.appendChild(this.g);
        this.container.appendChild(this.svg);
    }

    processData(data) {
        this.data = data.map((d, i) => {
            return {
                date: new Date(d.createdAt),
                amount: d.amount,
                cumulative: data.slice(0, i + 1).reduce((sum, item) => sum + item.amount, 0)
            };
        });
    }

    createScales() {
        // X scale (time)
        const xMin = this.data[0].date;
        const xMax = this.data[this.data.length - 1].date;
        this.xScale = (x) => {
            return (x - xMin) / (xMax - xMin) * this.width;
        };

        // Y scale (XP amount)
        const yMax = Math.max(...this.data.map(d => d.cumulative));
        this.yScale = (y) => {
            return this.height - (y / yMax * this.height);
        };

        // Store for axis generation
        this.yMax = yMax;
    }

    drawAxes() {
        // X Axis
        const xAxis = document.createElementNS("http://www.w3.org/2000/svg", "g");
        xAxis.setAttribute("class", "x-axis");
        xAxis.setAttribute("transform", `translate(0,${this.height})`);

        // X Axis line
        const xAxisLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
        xAxisLine.setAttribute("x1", "0");
        xAxisLine.setAttribute("x2", this.width);
        xAxisLine.setAttribute("stroke", "#4B5563");
        xAxis.appendChild(xAxisLine);

        // X Axis labels
        const numXTicks = 5;
        for (let i = 0; i <= numXTicks; i++) {
            const date = new Date(this.data[0].date.getTime() + (this.data[this.data.length - 1].date.getTime() - this.data[0].date.getTime()) * (i / numXTicks));
            const x = this.xScale(date);
            
            const tick = document.createElementNS("http://www.w3.org/2000/svg", "line");
            tick.setAttribute("x1", x);
            tick.setAttribute("x2", x);
            tick.setAttribute("y1", 0);
            tick.setAttribute("y2", 6);
            tick.setAttribute("stroke", "#4B5563");
            xAxis.appendChild(tick);

            const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
            label.setAttribute("x", x);
            label.setAttribute("y", 25);
            label.setAttribute("text-anchor", "middle");
            label.setAttribute("fill", "#9CA3AF");
            label.textContent = date.toLocaleDateString();
            xAxis.appendChild(label);
        }

        // Y Axis
        const yAxis = document.createElementNS("http://www.w3.org/2000/svg", "g");
        yAxis.setAttribute("class", "y-axis");

        // Y Axis line
        const yAxisLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
        yAxisLine.setAttribute("y1", "0");
        yAxisLine.setAttribute("y2", this.height);
        yAxisLine.setAttribute("stroke", "#4B5563");
        yAxis.appendChild(yAxisLine);

        // Y Axis labels
        const numYTicks = 5;
        for (let i = 0; i <= numYTicks; i++) {
            const yValue = (this.yMax * i) / numYTicks;
            const y = this.yScale(yValue);

            const tick = document.createElementNS("http://www.w3.org/2000/svg", "line");
            tick.setAttribute("x1", -6);
            tick.setAttribute("x2", 0);
            tick.setAttribute("y1", y);
            tick.setAttribute("y2", y);
            tick.setAttribute("stroke", "#4B5563");
            yAxis.appendChild(tick);

            const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
            label.setAttribute("x", -15);
            label.setAttribute("y", y);
            label.setAttribute("text-anchor", "end");
            label.setAttribute("dominant-baseline", "middle");
            label.setAttribute("fill", "#9CA3AF");
            label.textContent = formatXP(yValue);
            yAxis.appendChild(label);
        }

        this.g.appendChild(xAxis);
        this.g.appendChild(yAxis);
    }

    drawLine() {
        const line = document.createElementNS("http://www.w3.org/2000/svg", "path");
        
        const pathData = this.data.map((d, i) => {
            const x = this.xScale(d.date);
            const y = this.yScale(d.cumulative);
            return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
        }).join(' ');

        line.setAttribute("d", pathData);
        line.setAttribute("fill", "none");
        line.setAttribute("stroke", "#4ADE80");
        line.setAttribute("stroke-width", "2");
        
        this.g.appendChild(line);
    }

    drawPoints() {
        const pointsGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
        pointsGroup.setAttribute("class", "points");

        this.data.forEach(d => {
            const point = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            point.setAttribute("cx", this.xScale(d.date));
            point.setAttribute("cy", this.yScale(d.cumulative));
            point.setAttribute("r", "4");
            point.setAttribute("fill", "#4ADE80");
            point.setAttribute("data-date", d.date.toLocaleDateString());
            point.setAttribute("data-xp", formatXP(d.cumulative));
            
            // Add hover effect
            point.addEventListener("mouseover", (e) => this.showTooltip(e));
            point.addEventListener("mouseout", () => this.hideTooltip());
            
            pointsGroup.appendChild(point);
        });

        this.g.appendChild(pointsGroup);
    }

    setupTooltip() {
        this.tooltip = document.createElement("div");
        this.tooltip.className = "chart-tooltip";
        this.tooltip.style.position = "absolute";
        this.tooltip.style.display = "none";
        this.tooltip.style.backgroundColor = "rgba(17, 24, 39, 0.9)";
        this.tooltip.style.padding = "8px 12px";
        this.tooltip.style.borderRadius = "6px";
        this.tooltip.style.color = "#F3F4F6";
        this.tooltip.style.fontSize = "14px";
        this.tooltip.style.pointerEvents = "none";
        this.tooltip.style.zIndex = "1000";
        this.tooltip.style.border = "1px solid #374151";
        
        this.container.style.position = "relative";
        this.container.appendChild(this.tooltip);
    }

    showTooltip(event) {
        const point = event.target;
        const date = point.getAttribute("data-date");
        const xp = point.getAttribute("data-xp");
        
        this.tooltip.innerHTML = `
            <div>Date: ${date}</div>
            <div>Total XP: ${xp}</div>
        `;
        
        this.tooltip.style.display = "block";
        
        // Position tooltip
        const rect = this.container.getBoundingClientRect();
        const pointRect = point.getBoundingClientRect();
        const tooltipRect = this.tooltip.getBoundingClientRect();
        
        let left = pointRect.left - rect.left - (tooltipRect.width / 2) + 4;
        let top = pointRect.top - rect.top - tooltipRect.height - 10;
        
        // Ensure tooltip stays within container bounds
        left = Math.max(0, Math.min(left, rect.width - tooltipRect.width));
        top = Math.max(0, top);
        
        this.tooltip.style.left = `${left}px`;
        this.tooltip.style.top = `${top}px`;
    }

    hideTooltip() {
        this.tooltip.style.display = "none";
    }
}