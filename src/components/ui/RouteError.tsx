import { isRouteErrorResponse, Link, useRouteError } from 'react-router-dom'

export function RouteError() {
  const error = useRouteError()
  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
      ? error.message
      : 'The screen could not be drawn.'

  return (
    <div className="grid min-h-svh place-items-center bg-ground px-6">
      <div className="w-full max-w-[520px]">
        <h1 className="text-[22px] leading-7 font-semibold">This screen stopped</h1>
        <p className="mt-2 text-[13px] leading-5 text-muted">
          Something in the interface failed. Your basket and orders are kept in this browser, so nothing
          placed is lost.
        </p>
        <pre className="mt-4 overflow-x-auto rounded-[6px] bg-sunken px-3 py-2.5 text-[13px] leading-5">
          {message}
        </pre>
        <div className="mt-5 flex gap-2">
          <Link to="/" className="btn btn-primary">
            Back to the overview
          </Link>
          <button type="button" className="btn btn-secondary" onClick={() => window.location.reload()}>
            Reload the screen
          </button>
        </div>
      </div>
    </div>
  )
}
