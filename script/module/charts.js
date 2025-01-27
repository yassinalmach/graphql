import { executeQuery } from "./api.js";
import { XP_PROGRESS_QUERY, SKILL_QUERY } from "./queries.js";
import { formatXP } from "./utils.js";

export class SkillBarChart {
    constructor(container) {
        this.container = container;
        this.margin = { top: 20, right: 0, bottom: 90, left: 45 };
        this.width = container.clientWidth - this.margin.left - this.margin.right;
        this.height = 600 - this.margin.top - this.margin.bottom;
        this.barPadding = 0.15; // Space between bars
    }

    async initialize() {
        try {
            const data = await this.fetchData();
            if (!data || data.length === 0) return;

            this.createSVG();
            this.processData(data);
            this.createScales();
            this.drawAxes();
            this.drawBars();
            this.setupBarInfo();
        } catch (error) {
            console.error('Error initializing chart:', error);
            this.container.innerHTML = '<p class="error-message">Error loading chart data</p>';
        }
    }

    async fetchData() {
        const response = await executeQuery(SKILL_QUERY);
        return response.transaction;
    }

    // Create new SVG element using the SVG XML namespace
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

    // transforms raw data into an array [{name, amount}] and sorted by amount
    processData(data) {
        // Group and sum skills
        const skillsMap = new Map();

        data.forEach(item => {
            const skillName = this.formatSkillName(item.type);
            const currentAmount = skillsMap.get(skillName) || 0;
            skillsMap.set(skillName, Math.max(currentAmount, item.amount));
        });

        // Convert to array and sort by amount
        this.data = Array.from(skillsMap, ([name, amount]) => ({ name, amount }))
            .sort((a, b) => b.amount - a.amount);
    }

    // Remove 'skill_' prefix and format the name
    formatSkillName(skillType) {
        return skillType.replace('skill_', '');
    }

    // Creates scaling functions to convert data values to pixel positions
    createScales() {
        // X scale (skills)
        const barWidth = this.width / this.data.length;
        this.xScale = (x) => x * barWidth + (barWidth * this.barPadding) / 2;

        // Y scale (amount)
        const yMax = Math.max(...this.data.map(d => d.amount));
        this.yScale = (y) => this.height - (y / yMax * this.height);

        this.yMax = yMax;
        this.barWidth = (this.width / this.data.length) * (1 - this.barPadding);
    }

    // The function creates: X-axis for amount, Y-axis for skill values, labels for both axes
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
        this.data.forEach((d, i) => {
            const x = this.xScale(i) + this.barWidth / 2;

            const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
            label.setAttribute("x", x);
            label.setAttribute("y", 25);
            label.setAttribute("text-anchor", "end");
            label.setAttribute("transform", `rotate(-45, ${x}, 25)`);
            label.setAttribute("fill", "#9CA3AF");
            label.textContent = d.name;
            xAxis.appendChild(label);
        });

        // Y Axis
        const yAxis = document.createElementNS("http://www.w3.org/2000/svg", "g");
        yAxis.setAttribute("class", "y-axis");

        // Y Axis line
        const yAxisLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
        yAxisLine.setAttribute("y1", "0");
        yAxisLine.setAttribute("y2", this.height);
        yAxisLine.setAttribute("stroke", "#4B5563");
        yAxis.appendChild(yAxisLine);

        // Y Axis labels and grid lines
        const numYTicks = 10;
        for (let i = 0; i <= numYTicks; i++) {
            const yValue = (this.yMax * i) / numYTicks;
            const y = this.yScale(yValue);

            // Grid line
            const gridLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
            gridLine.setAttribute("x1", "0");
            gridLine.setAttribute("x2", this.width);
            gridLine.setAttribute("y1", y);
            gridLine.setAttribute("y2", y);
            gridLine.setAttribute("stroke", "#374151");
            gridLine.setAttribute("stroke-dasharray", "2,2");
            this.g.appendChild(gridLine);

            // Tick
            const tick = document.createElementNS("http://www.w3.org/2000/svg", "line");
            tick.setAttribute("x1", -6);
            tick.setAttribute("x2", 0);
            tick.setAttribute("y1", y);
            tick.setAttribute("y2", y);
            tick.setAttribute("stroke", "#4B5563");
            yAxis.appendChild(tick);

            // Label
            const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
            label.setAttribute("x", -15);
            label.setAttribute("y", y);
            label.setAttribute("text-anchor", "end");
            label.setAttribute("dominant-baseline", "middle");
            label.setAttribute("fill", "#9CA3AF");
            label.textContent = Math.round(yValue);
            yAxis.appendChild(label);
        }

        this.g.appendChild(xAxis);
        this.g.appendChild(yAxis);
    }

    // Creates bars
    drawBars() {
        const barsGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
        barsGroup.setAttribute("class", "bars");

        this.data.forEach((d, i) => {
            const bar = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            const x = this.xScale(i);
            const y = this.yScale(d.amount);
            const height = this.height - y;

            bar.setAttribute("x", x);
            bar.setAttribute("y", y);
            bar.setAttribute("width", this.barWidth);
            bar.setAttribute("height", height);
            bar.setAttribute("fill", "#4ADE80");
            bar.setAttribute("rx", "3"); // Rounded corners
            bar.setAttribute("data-skill", d.name);
            bar.setAttribute("data-amount", d.amount);

            bar.setAttribute("fill", `#4ADE80`);

            // Add hover effect
            bar.addEventListener("mouseover", (e) => this.showInfo(e));
            bar.addEventListener("mouseout", () => this.hideInfo());

            barsGroup.appendChild(bar);
        });

        this.g.appendChild(barsGroup);
    }

    // Creates and configures the tooltip element
    setupBarInfo() {
        this.tooltip = document.createElement("div");
        this.tooltip.className = "chart-tooltip";
        this.tooltip.style.position = "absolute";
        this.tooltip.style.display = "none";
        this.tooltip.style.backgroundColor = "#111827";
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

    // shows tooltip element
    showInfo(event) {
        const bar = event.target;
        const skill = bar.getAttribute("data-skill");
        const amount = bar.getAttribute("data-amount");

        this.tooltip.innerHTML = `
            <div>Skill: ${skill}</div>
            <div>Amount: ${amount}</div>
        `;

        this.tooltip.style.display = "block";

        // Position tooltip
        const rect = this.container.getBoundingClientRect();
        const barRect = bar.getBoundingClientRect();
        const tooltipRect = this.tooltip.getBoundingClientRect();

        let left = barRect.left - rect.left + (barRect.width / 2) - (tooltipRect.width / 2);
        let top = barRect.top - rect.top - tooltipRect.height - 10;

        // Ensure tooltip stays within container bounds
        left = Math.max(0, Math.min(left, rect.width - tooltipRect.width));
        top = Math.max(0, top);

        this.tooltip.style.left = `${left}px`;
        this.tooltip.style.top = `${top}px`;
    }

    // hide tooltip element
    hideInfo() {
        this.tooltip.style.display = "none";
    }
}

export class XPLineChart {
    constructor(container) {
        this.container = container;
        this.margin = { top: 20, right: 40, bottom: 90, left: 80 };
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
            this.setupBarInfo();
        } catch (error) {
            console.error('Error initializing chart:', error);
            this.container.innerHTML = '<p class="error-message">Error loading chart data</p>';
        }
    }

    async fetchData() {
        const response = await executeQuery(XP_PROGRESS_QUERY);
        return response.transaction;
    }

    // Create new SVG element using the SVG XML namespace
    createSVG() {
        this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        // viewBox="minX minY width height"
        this.svg.setAttribute("viewBox", `0 0 ${this.width + this.margin.left + this.margin.right} ${this.height + this.margin.top + this.margin.bottom}`);
        this.svg.style.width = "100%";
        this.svg.style.height = "100%";

        // Create a group (g) element to contain all chart elements
        this.g = document.createElementNS("http://www.w3.org/2000/svg", "g");
        this.g.setAttribute("transform", `translate(${this.margin.left},${this.margin.top})`);

        this.svg.appendChild(this.g);
        this.container.appendChild(this.svg);
    }

    // transforms raw xp data into a point format needed for the chart
    processData(data) {
        this.cumulativeXP = 0
        this.data = data.map((d) => {
            this.cumulativeXP += d.amount
            return {
                date: new Date(d.createdAt),
                amount: d.amount,
                projectName: d.object.name,
                cumulative: this.cumulativeXP,
            };
        });
    }

    // Creates scaling functions to convert data values to pixel positions
    createScales() {
        // X axis (time)
        const xMin = this.data[0].date;
        const xMax = this.data[this.data.length - 1].date;
        // (x - xMin): Shifts all dates to start at 0 - (xMax - xMin): Total time -  this.width: Scales to pixel width
        this.xScale = (x) => (x - xMin) / (xMax - xMin) * this.width;


        // Y scale (XP amount)
        const yMax = this.cumulativeXP;
        this.yScale = (y) => this.height - (y / yMax * this.height);

        // Store for axis generation
        this.yMax = yMax;
    }

    // The function creates: X-axis for time, Y-axis for XP values, labels for both axes
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
        const numXTicks = 10;
        for (let i = 0; i <= numXTicks; i++) {
            const date = new Date(this.data[0].date.getTime() + (this.data[this.data.length - 1].date.getTime() - this.data[0].date.getTime()) * i / numXTicks);
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
            // label.setAttribute("text-anchor", "middle");
            label.setAttribute("fill", "#9CA3AF");
            label.textContent = date.toLocaleDateString();
            xAxis.appendChild(label);
            label.setAttribute("text-anchor", "end");
            label.setAttribute("transform", `rotate(-45, ${x}, 25)`);
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
        const numYTicks = 10;
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

            // Grid line
            const gridLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
            gridLine.setAttribute("x1", "0");
            gridLine.setAttribute("x2", this.width);
            gridLine.setAttribute("y1", y);
            gridLine.setAttribute("y2", y);
            gridLine.setAttribute("stroke", "#374151");
            gridLine.setAttribute("stroke-dasharray", "2,2");
            this.g.appendChild(gridLine);

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

    // Creates the line of the data
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

    // Creates point to view data
    drawPoints() {
        const pointsGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
        pointsGroup.setAttribute("class", "points");

        this.data.forEach(d => {
            const point = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            point.setAttribute("cx", this.xScale(d.date));
            point.setAttribute("cy", this.yScale(d.cumulative));
            point.setAttribute("r", "4");
            point.setAttribute("fill", "#4ADE80");
            point.setAttribute("data-project", d.projectName);
            point.setAttribute("data-xp", formatXP(d.amount));
            point.setAttribute("data-date", d.date.toLocaleDateString());
            point.setAttribute("data-totalXP", formatXP(d.cumulative));


            // Add hover effect
            point.addEventListener("mouseover", (e) => this.showInfo(e));
            point.addEventListener("mouseout", () => this.hideInfo());

            pointsGroup.appendChild(point);
        });

        this.g.appendChild(pointsGroup);
    }

    // Creates and configures the tooltip element
    setupBarInfo() {
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

    // shows tooltip element
    showInfo(event) {
        const point = event.target;

        const projectName = point.getAttribute("data-project");
        const xp = point.getAttribute("data-xp");
        const date = point.getAttribute("data-date");
        const totalXP = point.getAttribute("data-totalXP");

        this.tooltip.innerHTML = `
            <div>${projectName}</div>
            <div>XP: ${xp}</div>
            <div>Date: ${date}</div>
            <div>Total XP: ${totalXP}</div>
        `;

        this.tooltip.style.display = "block";

        // Position tooltip
        const rect = this.container.getBoundingClientRect();
        const pointRect = point.getBoundingClientRect();
        const infoRect = this.tooltip.getBoundingClientRect();

        let left = pointRect.left - rect.left - (infoRect.width / 2);
        let top = pointRect.top - rect.top - infoRect.height - 10;

        // Ensure tooltip stays within container bounds
        left = Math.max(0, Math.min(left, rect.width - infoRect.width));
        top = Math.max(0, top);

        this.tooltip.style.left = `${left}px`;
        this.tooltip.style.top = `${top}px`;
    }

    // hide tooltip element
    hideInfo() {
        this.tooltip.style.display = "none";
    }
}