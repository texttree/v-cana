import { useEffect, useRef, useState } from 'react'

import { useRecoilState } from 'recoil'

import Modal from 'components/Modal'
import { indexImageCarousel } from 'components/state/atoms'
import FullSizeImageCarousel from './FullSizeImageCarousel'
import LoadMoreButton from './LoadMoreButton'
import { getImageUrl } from 'utils/helper'

import ArrowRight from 'public/folder-arrow-right.svg'
import Loading from 'public/progress.svg'
import Return from 'public/return.svg'

function Carousel({
  images,
  isShowLoadMoreButton,
  loadMore,
  isLoadingMore,
  isLoading,

  insideBigCarousel = false,
  cardSize = 134,
}) {
  const [currentIndex, setCurrentIndex] = useRecoilState(indexImageCarousel)
  const [isOpenModal, setIsOpenModal] = useState(false)
  const containerRef = useRef(null)
  const containerWidth = useRef(null)
  const lastIndex = images.length - 1
  const [maxVisibleIndex, setMaxVisibleIndex] = useState(0)

  const handlePrevClick = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? 0 : prevIndex - 1))
  }

  const handleNextClick = () => {
    setCurrentIndex((prevIndex) => {
      if (insideBigCarousel) {
        return prevIndex + 1
      } else {
        if (prevIndex === maxVisibleIndex) {
          return prevIndex
        } else {
          return prevIndex + 1
        }
      }
    })
  }

  useEffect(() => {
    if (containerRef.current && containerWidth.current === null) {
      containerWidth.current = containerRef.current.offsetWidth
    }

    const calculatedVisibleCards = containerWidth.current
      ? Math.floor(containerWidth.current / (cardSize + 10))
      : 0

    let calculatedMaxVisibleIndex = lastIndex

    if (calculatedVisibleCards < images.length) {
      calculatedMaxVisibleIndex = lastIndex - calculatedVisibleCards + 2
    } else {
      calculatedMaxVisibleIndex = currentIndex
    }

    setMaxVisibleIndex(calculatedMaxVisibleIndex)
  }, [images, currentIndex, lastIndex, cardSize])

  useEffect(() => {
    if (containerRef.current) {
      const containerElement = containerRef.current

      containerElement.style.transform = `translateX(-${
        currentIndex * (cardSize + 10)
      }px)`
      containerElement.style.transition = 'transform 0.3s ease-in-out'
    }
  }, [currentIndex, cardSize])

  return (
    <>
      {isLoading && !images?.length ? (
        <Loading className="progress-custom-colors m-auto w-6 animate-spin stroke-th-primary-100 right-2" />
      ) : (
        <>
          <div className="relative overflow-hidden">
            {images.length === 0 ? (
              <div className="text-center text-th-text-primary">No content available</div>
            ) : (
              <>
                <div
                  className={`flex ${insideBigCarousel ? 'pb-10' : 'pb-3.5'}`}
                  ref={containerRef}
                >
                  {images.map((image, index) =>
                    insideBigCarousel ? (
                      <div
                        key={image.id}
                        className="flex-none mr-2 rounded-md cursor-pointer"
                        style={{
                          width: `${cardSize}px`,
                          height: `${cardSize * 0.62}px`,
                        }}
                        onClick={() => setCurrentIndex(index)}
                      >
                        <div
                          className="bg-cover bg-center rounded-md"
                          style={{
                            backgroundImage: `url(${getImageUrl(image.url)})`,
                            paddingBottom: `${cardSize * 0.62}px`,
                          }}
                        />
                        <div className="text-left text-sm mt-2 truncate text-th-text-primary">
                          {image.name}
                        </div>
                      </div>
                    ) : (
                      <div
                        key={image.id}
                        className="relative flex-none mr-2.5 rounded-md overflow-hidden bg-cover bg-center cursor-pointer"
                        style={{
                          backgroundImage: `url(${getImageUrl(image.url)})`,
                          width: `${cardSize}px`,
                          height: `${cardSize * 0.62}px`,
                        }}
                        onClick={() => {
                          setCurrentIndex(index)
                          setIsOpenModal(true)
                        }}
                      >
                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2">
                          <div className="text-left text-sm truncate text-white">
                            {image.name}
                          </div>
                        </div>
                      </div>
                    )
                  )}

                  {images.length !== 0 && isShowLoadMoreButton && (
                    <LoadMoreButton
                      loadMore={loadMore}
                      isLoadingMore={isLoadingMore}
                      cardSize={insideBigCarousel ? 80 : 134}
                      insideBigCarousel={insideBigCarousel}
                    />
                  )}
                </div>

                <div
                  className={`flex ${
                    insideBigCarousel ? 'justify-center gap-5' : 'justify-between'
                  }`}
                >
                  <button
                    className="bg-th-text-primary text-th-secondary-10 font-bold p-3.5 rounded-full disabled:bg-th-secondary-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                    onClick={handlePrevClick}
                    disabled={currentIndex === 0 || images.length === 0}
                  >
                    <ArrowRight className="stroke-2 rotate-180" />
                  </button>
                  <button
                    className="bg-th-text-primary text-th-secondary-10 font-bold p-3 rounded-full disabled:bg-th-secondary-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                    onClick={() => setCurrentIndex(0)}
                    disabled={currentIndex === 0 || images.length === 0}
                  >
                    <Return />
                  </button>
                  <button
                    className="bg-th-text-primary text-th-secondary-10 font-bold p-3.5 rounded-full disabled:bg-th-secondary-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                    onClick={handleNextClick}
                    disabled={
                      (!insideBigCarousel && currentIndex === maxVisibleIndex) ||
                      currentIndex === lastIndex ||
                      images.length === 0
                    }
                  >
                    <ArrowRight className="stroke-2" />
                  </button>
                </div>
              </>
            )}
          </div>
          <Modal
            isOpen={isOpenModal}
            closeHandle={() => {
              setIsOpenModal(false)
            }}
            className={{
              main: 'z-50 relative',
              dialogTitle: 'text-center text-2xl font-medium leading-6',
              dialogPanel:
                'w-full h-full flex max-w-5xl p-6 transform overflow-y-auto transition-all text-th-text-primary-100 rounded-3xl',
              transitionChild: 'fixed inset-0 bg-[#424242] bg-opacity-90',
              content:
                'inset-0 top-4 fixed flex items-center justify-center p-4 min-h-full overflow-y-auto',
            }}
          >
            <FullSizeImageCarousel
              loadMore={loadMore}
              images={images}
              onClose={() => setIsOpenModal(false)}
              isShowLoadMoreButton={isShowLoadMoreButton}
              isLoadingMore={isLoadingMore}
            />
          </Modal>
        </>
      )}
    </>
  )
}

export default Carousel