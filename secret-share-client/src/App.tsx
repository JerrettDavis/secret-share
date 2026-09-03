/** @jsxImportSource theme-ui */
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import { ThemeUIProvider } from 'theme-ui';
import theme from './theme';
import AppLayout from './components/layout/AppLayout';
import PageMain from './components/layout/PageMain';
import { ArrowRight, LinkBroken } from './components/icons';
import Card from './components/ui/Card';
import Rise from './components/ui/Rise';
import CreatePage from '@features/create/CreatePage';
import RetrievePage from '@features/retrieve/RetrievePage';
import ManagePage from '@features/manage/ManagePage';

/**
 * Minimal 404. The retrieve flow owns the rich, specific error screens
 * (expired, already viewed, IP refused); this only catches URLs that are not
 * routes at all, so it stays deliberately small.
 */
function NotFoundPage() {
  return (
    <PageMain maxWidth="narrow" center>
      <Rise>
        <Card sx={{ display: 'flex', flexDirection: 'column', gap: 5, textAlign: 'center' }}>
          <span
            sx={{
              display: 'flex',
              alignSelf: 'center',
              alignItems: 'center',
              justifyContent: 'center',
              width: 48,
              height: 48,
              borderRadius: 6,
              bg: 'chip',
              color: 'textDim',
            }}
          >
            <LinkBroken size={24} />
          </span>
          <h1 sx={{ variant: 'text.pageTitle' }}>This page does not exist.</h1>
          <p sx={{ m: 0, fontSize: 5, lineHeight: 'lead', color: 'textSecondary' }}>
            Check the link you were sent — a share link looks like{' '}
            <code sx={{ fontFamily: 'monospace', fontSize: 2, color: 'text' }}>/retrieve/…</code>{' '}
            and a management link like{' '}
            <code sx={{ fontFamily: 'monospace', fontSize: 2, color: 'text' }}>/manage/…</code>.
          </p>
          <Link
            to="/"
            sx={{
              display: 'inline-flex',
              alignSelf: 'center',
              alignItems: 'center',
              gap: 2,
              fontSize: 4,
              fontWeight: 'medium',
            }}
          >
            Create a secret link
            <ArrowRight size={14} />
          </Link>
        </Card>
      </Rise>
    </PageMain>
  );
}

export function App() {
  return (
    <ThemeUIProvider theme={theme}>
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<CreatePage />} />
            <Route path="/retrieve/:identifier" element={<RetrievePage />} />
            <Route path="/manage/:creatorIdentifier" element={<ManagePage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </ThemeUIProvider>
  );
}

export default App;
