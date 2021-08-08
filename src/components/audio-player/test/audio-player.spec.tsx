import { newSpecPage } from '@stencil/core/testing';
import { AudioPlayer } from '../audio-player';

describe('audio-player', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [AudioPlayer],
      html: `<audio-player></audio-player>`,
    });
    expect(page.root).toEqualHtml(`
      <audio-player>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </audio-player>
    `);
  });
});
