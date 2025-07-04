import React from 'react'

type Props = {title: string, caption?: string, onclick?: (e: any) => void};

const ButtonCaption = ({title, caption, onclick}: Props) => {
  return (
    <>
      <button
        type="button"
        className="btn btn-primary mt-3 w-100 bg-sky-500 h-12"
        onClick={onclick}
      >
        {title}
      </button>
      <small className="text-grey-200 w-100 text-start">
        {caption!==''?caption:''}
      </small>
    </>
  )
}

export default ButtonCaption
