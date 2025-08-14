import React from 'react';

export default function Mosaic({photos, renderPhoto, isAdmin = false}) {
    return (
        <section className="mb-16">
          <div className="columns-3 gap-4">
            {photos.map((photo, index) => (
              <div key={photo.id} className="mb-4">
                {renderPhoto ? renderPhoto(photo, index) : (
                  <img src={photo.url} alt="" className="rounded" />
                )}
              </div>
            ))}
          </div>
          <hr className="mt-8 border-gray-300" />
        </section>
    );
}