import {
  Component,
  OnChanges,
  SimpleChanges,
  Input,
  Output,
  ViewChild,
  ElementRef,
  EventEmitter,
} from '@angular/core';

import * as UIkit from 'uikit';

import { cloneDeep as _cloneDeep } from 'lodash';

import { PickItemPipe } from '@cx/shared/pipes';
import { Content, ContentData } from '@cx/shared/types';

@Component({
  selector: 'cx-pages-content',
  templateUrl: 'pages-content.component.html',
  styleUrls: ['pages-content.component.scss'],
})
export class PagesContentComponent implements OnChanges {
  private _content: Content;

  @Input()
  get content(): Content {
    return this._content;
  }
  set content(value: Content) {
    this._content = _cloneDeep(value);
  }

  @Output() onSaveContent = new EventEmitter<{
    dataId: string;
    contentData: ContentData;
  }>();

  @ViewChild('cxContentModal') contentModalElementRef: ElementRef;

  constructor(private pickItem: PickItemPipe) {}

  ngOnChanges(changes: SimpleChanges): void {
    // check for changes in content
    if (changes.content && !changes.content.firstChange) {
      // check if metadata cointains values - otherwise return
      if (!Object.keys(this.content._metadata).length) {
        return;
      }

      // open the content modal window
      this.openContentModal();
    }
  }

  /** open modal window contains page content */
  openContentModal(): void {
    UIkit.modal(this.contentModalElementRef.nativeElement).show();
  }

  /**
   * update contentValue (contentValueModel) model (two-way data binding)
   * @param value new (updated) value of contentValue
   * @param index index of content data container to update
   */
  updateContent(value: any[], index: number): void {
    // use pickItemPipe to get proper key of content container
    const contentKey = this.pickItem.transform(this.content.data, 'key', index);

    // update value
    this.content.data[contentKey] = value;
  }

  /**
   * save page content
   * @param dataId data ID
   * @param contentData content to save
   */
  saveContent(dataId: string, contentData: ContentData): void {
    this.onSaveContent.emit({ dataId, contentData });
  }
}