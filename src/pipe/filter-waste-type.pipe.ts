import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterWasteType'
})
export class FilterWasteTypePipe implements PipeTransform {
  transform(items: any[], selectedTypes: string[]): any[] {
    if (!items || !selectedTypes || selectedTypes.length === 0) {
      return items;
    }
    return items.filter(item => {
      return item.wasteType.some((type: string) => selectedTypes.includes(type));
    });
  }
} 