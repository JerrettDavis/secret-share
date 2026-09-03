/** @jsxImportSource theme-ui */
import { Rise } from '@components/ui';
import type { RetrieveError } from '@api/errors';
import { retrieveErrorContent } from './retrieveErrorContent';

export interface RetrieveErrorStateProps {
  error: RetrieveError;
}

/**
 * The single shell for every terminal retrieve failure: a coloured rail, an
 * icon tile, a headline, lead copy, an optional per-code detail block, and a
 * per-code call to action. All per-code content — colour, icon, copy, detail
 * rendering, actions — comes from `retrieveErrorContent`; this component only
 * lays it out, so a sixth failure mode is a new map entry, not a new
 * component.
 */
export function RetrieveErrorState({ error }: RetrieveErrorStateProps) {
  const content = retrieveErrorContent[error.code];

  return (
    <Rise
      sx={{
        display: 'flex',
        border: '1px solid',
        borderColor: content.cardBorderColor,
        borderRadius: 6,
        backgroundColor: content.cardBg,
        overflow: 'hidden',
      }}
    >
      <div aria-hidden sx={{ flexShrink: 0, width: '3px', backgroundColor: content.railColor }} />
      <div
        sx={{
          flexGrow: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: [5, 6],
          px: [6, 8],
          py: [7, 8],
        }}
      >
        <span
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 46,
            height: 46,
            borderRadius: 5,
            backgroundColor: content.iconBg,
            border: '1px solid',
            borderColor: content.iconBorder,
            color: content.iconColor,
          }}
        >
          {content.icon}
        </span>

        <div sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <h1 sx={{ variant: 'text.title' }}>{content.title}</h1>
          <p sx={{ variant: 'text.lead' }}>
            {typeof content.body === 'function' ? content.body(error) : content.body}
          </p>
        </div>

        {content.renderDetail ? content.renderDetail(error) : null}

        <div sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>{content.renderActions(error)}</div>
      </div>
    </Rise>
  );
}

export default RetrieveErrorState;
