let inputPicker = document.getElementById("datetimepicker");
let calendarDaysSec = document.querySelector(".calendarDays")
let calendarSec = document.querySelector(".calendarArea")

class Calendar {
    title;
    time;
    date;

    constructor(title, time, date) {
        this.title = title;
        this.time = time;
        this.date = date;
    }
}

class httpRequestReq {
    requestedData = [];

    setData(data) {
        localStorage.setItem("calendarList", JSON.stringify(data))
    }

    getData() {
        if (localStorage.getItem("calendarList")) {
            this.requestedData = JSON.parse(localStorage.getItem("calendarList"));
        }
    }
}

class renderHtml {
    generateHtml(data, calendarData) {
        calendarDaysSec.innerHTML = [];
        calendarSec.innerHTML = [];
        this.generateDaysHtml(data);
        this.generateCalHtml(data, calendarData);
    }

    generateDaysHtml(data) {
        data.forEach(item => {
            calendarDaysSec.innerHTML += `<div>
                                        ${item.short} ${item.dayName}
                                        </div>`;
        });
    }

    generateCalHtml(data, calendarData) {
        data.forEach(item => {
            calendarSec.innerHTML += `<div>
                    ${this.generateCalendarItems(item.longInt, calendarData)}
                    </div>`;

        });

    }

    generateAddHtml(date, element, data = [], index = 0) {
        if (!element.innerHTML.includes('class="addArea"')) {
            let check = document.querySelector(".addArea");
            check && check.remove();

            if (data) {
                element.innerHTML += `<div class="addArea">
                                        <p>${date}</p>
                                        ${this.setAddData(data, date, index)}
                                    </div> `;
            } else {
                element.innerHTML += `<div class="addArea">
                                        <p>${date}</p>
                                        ${this.setAddData(false, date)}
                                    </div> `;
            }

            var timepicker = new TimePicker('time', {
                lang: 'en',
                theme: 'dark'
            });

            timepicker.on('change', function (evt) {
                var value = (evt.hour || '00') + ':' + (evt.minute || '00');
                evt.element.value = value;
            });
        }

    }

    generateCalendarItems(date, calendarData) {
        var html = "";
        calendarData.forEach((cal, index) => {

            if (cal.date == date) {
                html += `<div class="calItems" onclick="controller.openEditArea('${cal.date}',this.parentNode,${index})">
                        ${cal.title.substring(0, 4)}
                        </div>`;
            }
        });

        html += `<span class='addSpan' onclick="controller.openAddArea('${date}',this.parentNode)"></span>`

        return html;
    }

    setAddData(data, date, index = false) {
        var title = "";
        var time = "";
        var style = "style='display:none;'";

        if (data) {
            title = data.title;
            time = data.time;
            style = "";
        }

        return `<div class="flexArea">
                <input type="text" class="addText" id="title" placeholder='Add Title' value="${title}"/>
                <input type="text" class="addTime" id="time" placeholder="Time" value="${time}"> 
                </div>

                <div class="flexArea">
                <button onclick="controller.saveData('${date}',${index})" class"Save">Save</button>
                <button ${style} onclick="controller.deleteEntry(${index})" class"Delete">Delete</button>
                <button onclick="controller.closeAddArea()" class"Close">Close</button>
                </div>`;
    }



}

class viewController {
    httpReq = new httpRequestReq();
    renderhtml = new renderHtml();
    startDate;
    endDate;

    weekDayNames = {
        '0': 'Sunday',
        '1': 'Monday',
        '2': 'Tuesday',
        '3': 'Wednesday',
        '4': 'Thursday',
        '5': 'Friday',
        '6': 'Saturday',
    };

    constructor() {
        this.httpReq.getData();
        this.setDateTimePicker();
        this.generateCalendarDays();
    }

    setDateTimePicker() {
        $(inputPicker).daterangepicker({
            timePicker: true,
            startDate: moment().startOf('hour'),
            endDate: moment().startOf('hour').add(7, 'days'),
            locale: {
                format: 'YYYY-MM-DD HH:mm'
            }
        });

        let pickerOut = $(inputPicker).data('daterangepicker');
        this.startDate = pickerOut.startDate.format('YYYY-MM-DD HH:mm')
        this.endDate = pickerOut.endDate.format('YYYY-MM-DD HH:mm')

        var self = this;
        $(inputPicker).on('apply.daterangepicker', function (ev, picker) {
            self.startDate = picker.startDate.format('YYYY-MM-DD HH:mm')
            self.endDate = picker.endDate.format('YYYY-MM-DD HH:mm')
            self.generateCalendarDays();
        });
    }

    generateCalendarDays() {
        let daysData = {};
        let calendarDays = [];
        for (const m = moment(this.startDate); m.diff(this.endDate, 'days') <= 0; m.add(1, 'days')) {
            daysData = {
                'short': m.format('DD-MM'),
                'longInt': m.format('YYYY-MM-DD'),
                'dayOfWeek': m.day(),
                'dayName': this.weekDayNames[m.day()]
            };

            calendarDays.push(daysData);
        }
        this.renderhtml.generateHtml(calendarDays, this.httpReq.requestedData);
    }

    openAddArea(date, element) {
        this.renderhtml.generateAddHtml(date, element, false);
    }

    openEditArea(date, element, index) {
        this.renderhtml.generateAddHtml(date, element, this.httpReq.requestedData[index], index);
    }

    closeAddArea() {
        setTimeout(() => {
            document.querySelector(".addArea").remove();
        }, 10);
    }

    saveData(date, index) {
        let titleValue = document.getElementById("title").value;
        let timePickerValue = document.getElementById("time").value;
        let calendar = new Calendar(titleValue, timePickerValue, date);

        if (index) {
            this.httpReq.requestedData[index].title = calendar.title;
            this.httpReq.requestedData[index].time = calendar.time;
            this.httpReq.requestedData[index].date = calendar.date;
        } else {
            this.httpReq.requestedData.push(calendar);
        }

        this.httpReq.setData(this.httpReq.requestedData);
        this.generateCalendarDays();
    }

    deleteEntry(index) {
        this.httpReq.requestedData.splice(index, 1);
        this.httpReq.setData(this.httpReq.requestedData);
        this.generateCalendarDays();
    }
}

var controller = new viewController();