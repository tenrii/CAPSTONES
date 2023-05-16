import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'durationAgo'
})
export class DurationAgoPipe implements PipeTransform {
  transform(value: number, timeNow?: number): string {
    // Get the current time
    const now = timeNow || new Date().getTime();
    // Get the difference in milliseconds
    const diff = now - value;
    // Get the difference in seconds
    const seconds = Math.floor(diff / 1000);
    // Define the time units and their thresholds
    const units = [
      { name: 'second', limit: 60, in_seconds: 1 },
      { name: 'minute', limit: 3600, in_seconds: 60 },
      { name: 'hour', limit: 86400, in_seconds: 3600 },
      { name: 'day', limit: 604800, in_seconds: 86400 },
      { name: 'week', limit: 2629743, in_seconds: 604800 },
      { name: 'month', limit: 31556926, in_seconds: 2629743 },
      { name: 'year', limit: null, in_seconds: 31556926 }
    ];
    // Loop through the units
    for (const unit of units) {
      // If the difference is less than the unit limit or there is no limit
      if (seconds < unit.limit! || !unit.limit) {
        // Get the unit value
        const unitValue = Math.floor(seconds / unit.in_seconds);
        // Return the formatted string
        return `${unitValue >= 0 ? unitValue : 0} ${unit.name}${unitValue > 1 ? 's' : ''} ago`;
      }
    }
    // Fallback to the original date
    return value.toString();
  }
}
