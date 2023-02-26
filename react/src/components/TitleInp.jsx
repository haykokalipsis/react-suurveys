import React from 'react';

const TitleInp = (props) => {
    return (
        <div className="col-span-6 sm:col-span-3">
            <input
                type="text"
                name="title"
                id="title"
                placeholder="Survey Title"

                value={props.titleVal}
                onChange={(ev) => props.onInpEvent(ev.target.value)}
            />
        </div>
    );
};
export default TitleInp;
