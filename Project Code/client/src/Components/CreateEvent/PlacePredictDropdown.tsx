
interface props {
  predictions: Array<any>
  onClick: Function
  visible: boolean
}

function PlacePredictDropdown({...props}: props) {
  return <>
    {
      (props.visible) &&
      <div className='place-predict-container'>
        {
          props.predictions.map((place: any, index: number) => {
            return (
              <p className='place-predict-text' key={index} onClick={() => props.onClick(place.description)}>{place.description}</p>
            )
          })
        }
      </div>
    }
  </>
}

export default PlacePredictDropdown;