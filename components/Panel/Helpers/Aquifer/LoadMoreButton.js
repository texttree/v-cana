import Loading from 'public/progress.svg'

const LoadMoreButton = ({
  loadMore,
  insideBigCarousel,
  isLoadingMore = false,
  cardSize = 134,
}) => {
  return (
    <button
      className={`flex-none ${
        insideBigCarousel ? 'py-1 px-2 text-xs' : 'py-2 px-4'
      } font-bold rounded-md cursor-pointer text-gray-800 bg-gray-200 hover:bg-gray-300`}
      onClick={loadMore}
      style={{
        width: `${cardSize}px`,
        height: `${cardSize * 0.62}px`,
      }}
    >
      {isLoadingMore ? (
        <Loading className="progress-custom-colors m-auto w-6 animate-spin stroke-th-primary-100 opacity-70" />
      ) : (
        <span>Load more</span>
      )}
    </button>
  )
}
export default LoadMoreButton