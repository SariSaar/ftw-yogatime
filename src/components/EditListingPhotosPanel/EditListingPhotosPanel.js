import React, { Component } from 'react';
import { array, bool, func, object, string } from 'prop-types';
import { FormattedMessage } from '../../util/reactIntl';
import classNames from 'classnames';
import { LISTING_STATE_DRAFT } from '../../util/types';
import { EditListingPhotosForm } from '../../forms';
import { ensureOwnListing } from '../../util/data';
import { ListingLink } from '../../components';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';
import {arrayMoveImmutable} from 'array-move';

import css from './EditListingPhotosPanel.module.css';

const ImageList = SortableContainer(({images})=> {
  if (!images) {
    return null;
  }

  return (
    <div>
      {images.map((img, idx) => (
        <div>
          <ImageElement
            index={idx}
            key={img.id.uuid}
            id={img.id.uuid}
          />
        </div>
      ))}
    </div>
  )
})

const ImageElement = SortableElement(props => {
  const { id } = props;

  return(
    <div>
      <span key={id} >Image id: {id} </span>
    </div>
  )
})

class EditListingPhotosPanel extends Component {
  constructor(props){
    super(props);

    this.state = {
      reorderedImages: null,
    }
  }

  render() {
    const {
      className,
      rootClassName,
      errors,
      disabled,
      ready,
      images,
      listing,
      onImageUpload,
      onUpdateImageOrder,
      submitButtonText,
      panelUpdated,
      updateInProgress,
      onChange,
      onSubmit,
      onRemoveImage,
    } = this.props;

    const rootClass = rootClassName || css.root;
    const classes = classNames(rootClass, className);
    const currentListing = ensureOwnListing(listing);

    const onSortEnd = ({ oldIndex, newIndex }) => {
      console.log({ oldIndex }, { newIndex });
      const newImages = arrayMoveImmutable(images, oldIndex, newIndex);
      this.setState({ reorderedImages: newImages })
    }    

    const isPublished =
      currentListing.id && currentListing.attributes.state !== LISTING_STATE_DRAFT;
    const panelTitle = isPublished ? (
      <FormattedMessage
        id="EditListingPhotosPanel.title"
        values={{
          listingTitle: (
            <ListingLink listing={listing}>
              <FormattedMessage id="EditListingPhotosPanel.listingTitle" />
            </ListingLink>
          ),
        }}
      />
    ) : (
      <FormattedMessage id="EditListingPhotosPanel.createListingTitle" />
    );

    return (
      <div className={classes}>
        <h1 className={css.title}>{panelTitle}</h1>
        <EditListingPhotosForm
          className={css.form}
          disabled={disabled}
          ready={ready}
          fetchErrors={errors}
          initialValues={{ images }}
          images={images}
          onImageUpload={onImageUpload}
          onSubmit={values => {
            const { addImage, ...updateValues } = values;

            if (!!this.state.reorderedImages) {
              const reorderedValues = {
                ...updateValues,
                images: this.state.reorderedImages,
              } 

              onSubmit(reorderedValues)
            } else {
            onSubmit(updateValues);
            }

          }}
          onChange={onChange}
          onUpdateImageOrder={onUpdateImageOrder}
          onRemoveImage={onRemoveImage}
          saveActionMsg={submitButtonText}
          updated={panelUpdated}
          updateInProgress={updateInProgress}
        />

          <div>
            <ImageList 
              onSortEnd={onSortEnd}
              images={images}
              axis='y'
              />
          </div>
      </div>
    );
  }
}

EditListingPhotosPanel.defaultProps = {
  className: null,
  rootClassName: null,
  errors: null,
  images: [],
  listing: null,
};

EditListingPhotosPanel.propTypes = {
  className: string,
  rootClassName: string,
  errors: object,
  disabled: bool.isRequired,
  ready: bool.isRequired,
  images: array,

  // We cannot use propTypes.listing since the listing might be a draft.
  listing: object,

  onImageUpload: func.isRequired,
  onUpdateImageOrder: func.isRequired,
  onSubmit: func.isRequired,
  onChange: func.isRequired,
  submitButtonText: string.isRequired,
  panelUpdated: bool.isRequired,
  updateInProgress: bool.isRequired,
  onRemoveImage: func.isRequired,
};

export default EditListingPhotosPanel;
