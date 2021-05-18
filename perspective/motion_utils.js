
function travel(pos_json){
    /*
    1. Update the relative position given the new camera position
    2. Find the corresponding 2d position on screen
    3. Alter the radius
     */
    pos_json.relative_pos = get_relative_to_camera(pos_json.relative_pos)
    dim_shift(pos_json,type='from_3d')
    radius_alter(pos_json)
}

function dim_shift(pos_json,
                   type='to_3d',
                   x_3d_coord = pos_json.relative_pos.x,
                   initialize=false){
    /*
    to_3d(to get pos_json.relative_pos): goes from 2d screen coords to universe coords taking into
        account the window params: finds the unit vector of the 3d vector
        relative to the observer. Finds the scaling factor 'k' such that
        when this unit vector is multiplied by this, it will reach the point
        of the desired x value. The new y,z positions are the old ones scaled
        by this factor and z is the desired z.
    from_3d(to get pos_json.screen_pos): reverse logic.
    x_random: value of x wrt the window, useful only from 2d to 3d conversion
     */
    if (type==='to_3d'){
        observer_rel_2d_norm = createVector(window_params.offset, pos_json.screen_pos.y, pos_json.screen_pos.z).normalize()
        scale_factor = (x_3d_coord+window_params.offset)/observer_rel_2d_norm.x
        full_vec = createVector(
            x_3d_coord,
            scale_factor*observer_rel_2d_norm.y,
            scale_factor*observer_rel_2d_norm.z)
        pos_json.relative_pos = full_vec
        if (initialize){
            pos_json.fixed_pos = full_vec
        }
    } else if (type==='from_3d'){
        observer_rel_3d_norm = createVector(
            pos_json.relative_pos.x + window_params.offset,
            pos_json.relative_pos.y,
            pos_json.relative_pos.z).normalize()
        scale_factor = window_params.offset/observer_rel_3d_norm.x
        console.log('scale factor', scale_factor)
        pos_json.screen_pos = createVector(
            0,
            scale_factor*observer_rel_3d_norm.y,
            scale_factor*observer_rel_3d_norm.z)
    }
}

function transform_axes(pos_vec,type='to'){
    /*
    This function transforms and translates to the new frame and set of
    defined axes.
    pos_vec: p5.Vector type
    to: inbuilt > new type
    from: new type > inbuilt
     */
    if (type==='to'){
        rel_pos_vec = pos_vec.sub(...center)
        return createVector(rel_pos_vec.z,rel_pos_vec.x,rel_pos_vec.y)}
    else if (type==='from'){
        transformed_vec = createVector(pos_vec.y,pos_vec.z,pos_vec.x)
        return transformed_vec.add(...center)}
}

function get_relative_to_camera(pos_vec){
    /*
    This func finds the relative position vector of star wrt current camera_polar
     */
    return pos_vec.sub(p5.Vector.fromAngles(camera_params.pos_sph.x,camera_params.pos_sph.y,camera_params.pos_sph.z))
}

function radius_alter(pos_json){
    /*
    Using similar triangles, finds the radius value at the current
    position wrt the original spawn position
     */
    pos_json.screen_rad = (pos_json.fixed_pos.mag()*pos_json.fixed_rad)/pos_json.relative_pos.mag();
}

function spawn_by_shape(){
    /*
    Returns a new set of 2d screen coordinates for the object
    based on the how the spaceship window looks!
     */
    let circ_calc = function(){return math.sqrt(math.square(h/w)*(math.square(w)-math.square(x_abs-x)))}
    let [x_abs,x,y,w,h] = [math.randomInt(width),...center,window_params.w, window_params.h]
    if ((x-w/2)<=x_abs && x_abs<=(x+w/2)) {
        if (window_params.shape === 'ellipse') {
            y_lim = circ_calc()
        } else if (window_params.shape === 'circle') {
            h = w
            y_lim = circ_calc()
        } else if (window_params.shape === 'rect') {
            y_lim = h/2
        }
        y_abs = [math.randomInt(y - y_lim), math.randomInt(y + y_lim, height)][math.randomInt(2)]
    } else {
        y_abs = math.randomInt(height)
    }
    return transform_axes(createVector(x_abs,y_abs,0),type='to')
}