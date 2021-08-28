import React, { Component } from 'react';
import 'react-dates/initialize';
import moment from 'moment';
import { DateRangePicker } from 'react-dates';
import 'react-dates/lib/css/_datepicker.css';

import './Element.css';

class DatePicker extends Component {
  constructor(props) {
    super(props);
    this.state = {
      focusedInput: null,
    };
  }

  render() {
    const { startDate, endDate, handleDatesChange } = this.props;
    const { focusedInput } = this.state;
    return (
      <div className="customDatePickerWidth">
        <DateRangePicker
          displayFormat="DD/MM/YYYY"
          startDate={startDate}
          startDateId="startDate"
          endDate={endDate}
          endDateId="endDate"
          onDatesChange={handleDatesChange}
          numberOfMonths={2}
          initialVisibleMonth={() => moment().subtract(1, 'months')}
          focusedInput={focusedInput}
                    /* eslint-disable-next-line no-shadow */
          onFocusChange={(focusedInput) => this.setState({ focusedInput })}
          isOutsideRange={(day) => {
            let dayIsBlocked = false;
            if (moment().set({ hours: 23, minutes: 59, seconds: 59 }).diff(day) <= 0) {
              dayIsBlocked = true;
            }
            return dayIsBlocked;
          }}
        />
      </div>
    );
  }
}

export default DatePicker;
